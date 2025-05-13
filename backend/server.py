from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import httpx # For making requests to Telegram Bot API

# Import the new validation utility
from auth_utils import validate_init_data

# Root directory and env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Debug: Log environment variables after loading .env
logging.basicConfig(level=logging.INFO) # Ensure logging is configured
logging.info(f"[DEBUG_ENV] TELEGRAM_BOT_TOKEN from os.getenv: {os.getenv('TELEGRAM_BOT_TOKEN')}")
logging.info(f"[DEBUG_ENV] MONGO_URL from os.getenv: {os.getenv('MONGO_URL')}")

# MongoDB connection
mongo_url = os.getenv("MONGO_URL")
if not mongo_url:
    logging.error("MONGO_URL not set in environment variables")
    # For now, we proceed, but it will fail if mongo_url is truly needed and not set

client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv("DB_NAME", "telewall_db")]

# Create the main app without a prefix
app = FastAPI()

# Routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/api/auth")
payments_router = APIRouter(prefix="/api/payments") # New router for payments

# --- Pydantic Models ---
class TelegramUserFromInitData(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int

class InitDataRequest(BaseModel):
    init_data_str: str

class UserPrivacy(BaseModel):
    wall_visibility: str = Field(default="all", pattern="^(all|friends|nobody)$")
    can_post: str = Field(default="all", pattern="^(all|friends|nobody)$")

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: str # This is the Telegram user ID, should be unique
    username: Optional[str] = None
    name: str
    photo_url: Optional[str] = None
    description: Optional[str] = None
    privacy: UserPrivacy = Field(default_factory=UserPrivacy)
    stars_balance: int = Field(default=0) # User's balance of stars (managed by app logic, not directly by TG Stars API for user balance)
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
    user_id: str # This should be the internal UserProfile.id

class Post(PostBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str # This is the internal UserProfile.id
    likes: int = 0
    comments: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class GiftBase(BaseModel):
    type: str
    message: Optional[str] = None

class GiftCreate(GiftBase):
    sender_id: str # Internal UserProfile.id
    receiver_id: str # Internal UserProfile.id

class Gift(GiftBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Payment Specific Models ---
class StoreItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price_stars: int # Price in Telegram Stars
    item_type: str # e.g., 'brush', 'theme', 'feature_unlock'
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None # For additional item-specific data
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserInventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_profile_id: str # Link to UserProfile.id
    store_item_id: str   # Link to StoreItem.id
    item_name: str # Denormalized for easier display
    purchase_date: datetime = Field(default_factory=datetime.utcnow)
    telegram_payment_charge_id: str # From successful payment
    metadata: Optional[Dict[str, Any]] = None # e.g., activation details

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_profile_id: str
    store_item_id: str
    invoice_payload: str = Field(unique=True) # Unique payload for this transaction
    telegram_payment_charge_id: Optional[str] = None
    amount_stars: int
    currency: str = "XTR"
    status: str = "pending"  # pending, completed, failed, refunded
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreateInvoiceLinkRequest(BaseModel):
    store_item_id: str
    # user_profile_id will be derived from authenticated user (e.g. via initData or session)

class CreateInvoiceLinkResponse(BaseModel):
    invoice_url: str
    payload: str # The payload used for the invoice

class LabeledPrice(BaseModel):
    label: str
    amount: int # In the smallest units of the currency (for XTR, 1 star = 1 unit)

# --- Telegram API Helper ---
async def call_telegram_api(method: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        logging.error("TELEGRAM_BOT_TOKEN is not configured.")
        raise HTTPException(status_code=500, detail="Telegram Bot Token not configured.")
    
    url = f"https://api.telegram.org/bot{bot_token}/{method}"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=data)
            response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
            return response.json()
        except httpx.HTTPStatusError as e:
            logging.error(f"Telegram API error for method {method}: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Telegram API error: {e.response.text}")
        except httpx.RequestError as e:
            logging.error(f"Request error calling Telegram API method {method}: {e}")
            raise HTTPException(status_code=503, detail=f"Telegram API request failed: {e}")

# --- Authentication Endpoint --- 
@auth_router.post("/telegram_login", response_model=UserProfile)
async def login_with_telegram(request_body: InitDataRequest = Body(...)):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        logging.error("TELEGRAM_BOT_TOKEN is not configured on the server.")
        raise HTTPException(status_code=500, detail="Server configuration error: Bot token missing.")

    telegram_user_data = validate_init_data(request_body.init_data_str, bot_token)

    if not telegram_user_data:
        raise HTTPException(status_code=401, detail="Invalid or tampered initData.")

    tg_user = TelegramUserFromInitData(**telegram_user_data)
    existing_user_doc = await db.users.find_one({"telegram_id": tg_user.id})
    user_name = tg_user.first_name
    if tg_user.last_name:
        user_name += f" {tg_user.last_name}"

    if existing_user_doc:
        update_fields = {
            "username": tg_user.username,
            "name": user_name,
            "photo_url": tg_user.photo_url,
            "updated_at": datetime.utcnow()
        }
        update_fields = {k: v for k, v in update_fields.items() if v is not None or k == "photo_url" or k == "username"} # Allow None to clear photo/username
        
        await db.users.update_one(
            {"telegram_id": tg_user.id},
            {"$set": update_fields}
        )
        # Fetch the potentially updated document to include all fields like 'id'
        updated_user_doc = await db.users.find_one({"telegram_id": tg_user.id})
        return UserProfile(**updated_user_doc)
    else:
        new_user_profile = UserProfile(
            telegram_id=tg_user.id,
            username=tg_user.username,
            name=user_name,
            photo_url=tg_user.photo_url,
        )
        await db.users.insert_one(new_user_profile.dict(by_alias=True))
        return new_user_profile

# --- Payment Endpoints ---
@payments_router.post("/create_invoice_link", response_model=CreateInvoiceLinkResponse)
async def create_invoice_link(request_data: CreateInvoiceLinkRequest, current_user_tg_id: str = Depends(lambda x: "dummy_user_id")):
    # TODO: Replace dummy_user_id with actual authenticated user's telegram_id from initData/session
    # For now, we'll assume current_user_tg_id is passed or derived correctly.
    # This dependency needs to be properly implemented for security.
    # A placeholder for fetching user based on a validated initData or session token:
    user_profile = await db.users.find_one({"telegram_id": current_user_tg_id}) 
    if not user_profile:
        # This check should be part of an authentication dependency
        raise HTTPException(status_code=401, detail="User not authenticated or not found")

    store_item_doc = await db.store_items.find_one({"id": request_data.store_item_id, "is_active": True})
    if not store_item_doc:
        raise HTTPException(status_code=404, detail="Store item not found or not active.")
    
    store_item = StoreItem(**store_item_doc)
    invoice_payload = f"tgwall_item_{store_item.id}_user_{user_profile['id']}_{str(uuid.uuid4())[:8]}"

    # Create a pending transaction record
    new_transaction = PaymentTransaction(
        user_profile_id=user_profile["id"],
        store_item_id=store_item.id,
        invoice_payload=invoice_payload,
        amount_stars=store_item.price_stars,
        status="pending"
    )
    await db.payment_transactions.insert_one(new_transaction.dict(by_alias=True))

    prices = [LabeledPrice(label=store_item.name, amount=store_item.price_stars)]
    invoice_data = {
        "title": store_item.name,
        "description": store_item.description,
        "payload": invoice_payload,
        "currency": "XTR",
        "prices": [p.dict() for p in prices],
        # "provider_token": "", # Not needed for XTR
        # "start_parameter": "some_deep_link_param", # Optional
        "photo_url": store_item.image_url, # Optional
        "photo_width": 512, # Optional, if photo_url is present
        "photo_height": 512, # Optional
        "need_name": False, # For XTR, usually not needed
        "need_phone_number": False,
        "need_email": False,
        "need_shipping_address": False,
        "send_phone_number_to_provider": False,
        "send_email_to_provider": False,
        "is_flexible": False, # Not typically used with XTR simple invoices
    }
    # Remove None values from invoice_data to avoid sending empty optional fields
    invoice_data_cleaned = {k: v for k, v in invoice_data.items() if v is not None}

    try:
        response_json = await call_telegram_api("createInvoiceLink", invoice_data_cleaned)
        if response_json.get("ok") and response_json.get("result"):
            return CreateInvoiceLinkResponse(invoice_url=response_json["result"], payload=invoice_payload)
        else:
            logging.error(f"Failed to create invoice link: {response_json}")
            await db.payment_transactions.update_one(
                {"invoice_payload": invoice_payload},
                {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
            )
            raise HTTPException(status_code=500, detail=f"Failed to create invoice link with Telegram: {response_json.get('description', 'Unknown error')}")
    except HTTPException as e:
        # Propagate HTTPExceptions from call_telegram_api or others
        await db.payment_transactions.update_one(
            {"invoice_payload": invoice_payload},
            {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
        )
        raise e
    except Exception as e:
        logging.error(f"Unexpected error creating invoice link: {e}")
        await db.payment_transactions.update_one(
            {"invoice_payload": invoice_payload},
            {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
        )
        raise HTTPException(status_code=500, detail="Unexpected error creating invoice link.")

@payments_router.post("/telegram_webhook")
async def telegram_webhook(request: Request):
    # It's crucial to validate that this request comes from Telegram, 
    # e.g., by checking a secret token in the URL or headers if Telegram supports it for webhooks.
    # For now, we assume the webhook URL is secret enough.
    update_data = await request.json()
    logging.info(f"Received Telegram webhook: {update_data}")

    if "pre_checkout_query" in update_data:
        pre_checkout_query = update_data["pre_checkout_query"]
        query_id = pre_checkout_query["id"]
        invoice_payload = pre_checkout_query["invoice_payload"]
        # amount = pre_checkout_query["total_amount"]
        # currency = pre_checkout_query["currency"]

        # Validate the payload and if the order can be fulfilled
        transaction = await db.payment_transactions.find_one({"invoice_payload": invoice_payload, "status": "pending"})
        if not transaction:
            logging.warning(f"PreCheckoutQuery for unknown or non-pending transaction payload: {invoice_payload}")
            await call_telegram_api("answerPreCheckoutQuery", {"pre_checkout_query_id": query_id, "ok": False, "error_message": "Transaction not found or already processed."})
            return JSONResponse(content={"status": "error", "message": "Transaction not found"})
        
        # Additional checks: e.g., item still available, user can purchase, etc.
        # For now, assume ok if transaction is found and pending.
        await call_telegram_api("answerPreCheckoutQuery", {"pre_checkout_query_id": query_id, "ok": True})
        logging.info(f"Responded OK to PreCheckoutQuery ID: {query_id} for payload: {invoice_payload}")
        return JSONResponse(content={"status": "ok"})

    elif "successful_payment" in update_data:
        successful_payment = update_data["successful_payment"]
        invoice_payload = successful_payment["invoice_payload"]
        telegram_payment_charge_id = successful_payment["telegram_payment_charge_id"]
        # total_amount = successful_payment["total_amount"]
        # currency = successful_payment["currency"]

        transaction_doc = await db.payment_transactions.find_one({"invoice_payload": invoice_payload, "status": "pending"})
        if not transaction_doc:
            logging.warning(f"SuccessfulPayment for unknown or non-pending transaction payload: {invoice_payload}. Charge ID: {telegram_payment_charge_id}")
            # This might indicate a duplicate notification or an issue. Log and investigate.
            return JSONResponse(content={"status": "error", "message": "Transaction not found or already processed for successful payment."})

        transaction = PaymentTransaction(**transaction_doc)

        # Update transaction status
        await db.payment_transactions.update_one(
            {"invoice_payload": invoice_payload},
            {"$set": {"status": "completed", "telegram_payment_charge_id": telegram_payment_charge_id, "updated_at": datetime.utcnow()}}
        )

        # Grant item to user
        store_item_doc = await db.store_items.find_one({"id": transaction.store_item_id})
        if store_item_doc:
            inventory_item = UserInventoryItem(
                user_profile_id=transaction.user_profile_id,
                store_item_id=transaction.store_item_id,
                item_name=store_item_doc.get("name", "Unknown Item"),
                telegram_payment_charge_id=telegram_payment_charge_id
            )
            await db.user_inventory.insert_one(inventory_item.dict(by_alias=True))
            logging.info(f"Item {store_item_doc.get('name')} granted to user {transaction.user_profile_id} via inventory.")
        else:
            logging.error(f"Store item with ID {transaction.store_item_id} not found after successful payment for payload {invoice_payload}.")

        logging.info(f"Processed SuccessfulPayment for payload: {invoice_payload}, Charge ID: {telegram_payment_charge_id}")
        return JSONResponse(content={"status": "ok"})

    return JSONResponse(content={"status": "unhandled_update_type"}, status_code=400)

# --- Other API Endpoints (Posts, Gifts, Profile - to be implemented or verified) ---
@api_router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if user:
        return UserProfile(**user)
    raise HTTPException(status_code=404, detail="User not found")

@api_router.get("/posts/{user_id}", response_model=List[Post])
async def get_user_posts(user_id: str):
    # This should fetch posts for a UserProfile.id, not telegram_id directly unless that's the design
    user_profile = await db.users.find_one({"id": user_id})
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found to fetch posts.")
    posts = await db.posts.find({"user_id": user_profile["id"]}).to_list(length=100)
    return [Post(**post) for post in posts]

@api_router.post("/posts", response_model=Post, status_code=201)
async def create_post(post_data: PostCreate):
    # Assume post_data.user_id is the UserProfile.id, which should be validated/obtained from auth
    user_profile = await db.users.find_one({"id": post_data.user_id})
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found for creating post.")
    
    new_post = Post(**post_data.dict())
    await db.posts.insert_one(new_post.dict(by_alias=True))
    return new_post

# Include routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(payments_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Root endpoint for health check
@app.get("/")
async def read_root():
    return {"message": "TgWall API is running"}

# --- Application Lifecycle Events (Optional but good for DB connection) ---
@app.on_event("startup")
async def startup_event():
    # In a real app, you might re-initialize client here if it wasn't global
    # or perform other startup tasks.
    # For now, client is global, so this is more of a placeholder.
    logging.info("MongoDB client initialized.") # This log might be redundant if client is global

@app.on_event("shutdown")
async def shutdown_event():
    if client:
        client.close()
        logging.info("MongoDB client closed.")

if __name__ == "__main__":
    # This block is for direct execution, e.g., `python server.py`
    # Uvicorn is usually preferred for production: `uvicorn server:app --reload`
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

