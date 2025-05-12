
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json

# Root directory and env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'telewall_db')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class TelegramUser(BaseModel):
    id: str
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int

class UserPrivacy(BaseModel):
    wall_visibility: str = "all"  # all, friends, nobody
    can_post: str = "all"  # all, friends, nobody

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: str
    username: Optional[str] = None
    name: str
    photo_url: Optional[str] = None
    description: Optional[str] = None
    privacy: Optional[UserPrivacy] = Field(default_factory=UserPrivacy)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    telegram_id: str
    username: Optional[str] = None
    name: str
    photo_url: Optional[str] = None
    description: Optional[str] = None

class PostBase(BaseModel):
    content: str
    type: str  # text, image, drawing

class PostCreate(PostBase):
    user_id: str

class Post(PostBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class GiftBase(BaseModel):
    type: str
    message: Optional[str] = None

class GiftCreate(GiftBase):
    sender_id: str
    receiver_id: str

class Gift(GiftBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "TeleWall API is running"}

# User Profile API
@api_router.post("/users", response_model=UserProfile)
async def create_user(user: UserProfileCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"telegram_id": user.telegram_id})
    if existing_user:
        user_obj = UserProfile(**existing_user)
        return user_obj
    
    # Create new user
    user_obj = UserProfile(
        telegram_id=user.telegram_id,
        username=user.username,
        name=user.name,
        photo_url=user.photo_url,
        description=user.description
    )
    
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = await db.users.find_one({"telegram_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(**user)

@api_router.put("/users/{user_id}", response_model=UserProfile)
async def update_user(user_id: str, user_update: UserProfileCreate):
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = await db.users.find_one({"telegram_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    user_obj = UserProfile(**user)
    update_data = user_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in DB
    await db.users.update_one({"id": user_obj.id}, {"$set": update_data})
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user_obj.id})
    return UserProfile(**updated_user)

# Posts API
@api_router.post("/posts", response_model=Post)
async def create_post(post: PostCreate):
    post_obj = Post(
        content=post.content,
        type=post.type,
        user_id=post.user_id
    )
    
    await db.posts.insert_one(post_obj.dict())
    return post_obj

@api_router.get("/posts", response_model=List[Post])
async def get_posts(limit: int = 20, offset: int = 0):
    posts = await db.posts.find().sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    return [Post(**post) for post in posts]

@api_router.get("/users/{user_id}/posts", response_model=List[Post])
async def get_user_posts(user_id: str, limit: int = 20, offset: int = 0):
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = await db.users.find_one({"telegram_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = UserProfile(**user)
    posts = await db.posts.find({"user_id": user_obj.id}).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    return [Post(**post) for post in posts]

# Gifts API
@api_router.post("/gifts", response_model=Gift)
async def create_gift(gift: GiftCreate):
    gift_obj = Gift(
        type=gift.type,
        message=gift.message,
        sender_id=gift.sender_id,
        receiver_id=gift.receiver_id
    )
    
    await db.gifts.insert_one(gift_obj.dict())
    return gift_obj

@api_router.get("/users/{user_id}/gifts", response_model=List[Gift])
async def get_user_gifts(user_id: str, limit: int = 20, offset: int = 0):
    user = await db.users.find_one({"id": user_id})
    if not user:
        user = await db.users.find_one({"telegram_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = UserProfile(**user)
    gifts = await db.gifts.find({"receiver_id": user_obj.id}).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    return [Gift(**gift) for gift in gifts]

# Include the router in the main app
app.include_router(api_router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
      