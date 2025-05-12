
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import axios from "axios";
import { initData, miniApp } from "@telegram-apps/sdk-react";
import CanvasDraw from "react-canvas-draw";

// Constants
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const UserProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">TeleWall</h1>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">0 ★</span>
          <button className="text-2xl">≡</button>
        </div>
      </div>

      {/* User Profile */}
      <div className="bg-gray-900 rounded-lg m-4 p-4">
        <div className="flex items-center">
          <img 
            src={user?.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
            alt={user?.name || "User"} 
            className="w-14 h-14 rounded-full mr-4" 
          />
          <div>
            <h2 className="text-xl font-bold">{user?.name || "User Name"}</h2>
            <p className="text-gray-400">@{user?.username || "username"}</p>
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center">
            <span className="mr-2">🎁</span> Отправить подарок
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center">
            <span className="mr-2">👥</span> Добавить в друзья
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900 rounded-t-lg mx-4 mt-4">
        <button 
          className={`px-4 py-2 flex-1 text-center ${activeTab === 'posts' ? 'bg-black rounded-t-lg' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Посты
        </button>
        <button 
          className={`px-4 py-2 flex-1 text-center ${activeTab === 'gifts' ? 'bg-black rounded-t-lg' : ''}`}
          onClick={() => setActiveTab('gifts')}
        >
          Подарки
        </button>
      </div>

      {/* Content */}
      <div className="bg-black mx-4 p-4 rounded-b-lg">
        {activeTab === 'posts' ? (
          <div>
            {user?.posts?.length > 0 ? (
              user.posts.map(post => (
                <PostItem key={post.id} post={post} />
              ))
            ) : (
              <div className="post-item bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <img 
                    src={user?.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                    alt={user?.name || "User"} 
                    className="w-10 h-10 rounded-full mr-3" 
                  />
                  <div>
                    <h3 className="font-bold">{user?.name || "User Name"}</h3>
                    <p className="text-xs text-gray-400">25.04.2025, 20:39:51</p>
                  </div>
                  {post?.type === 'drawing' && (
                    <span className="ml-auto text-gray-400">Рисунок</span>
                  )}
                </div>
                <div className="mt-3 bg-white rounded-lg overflow-hidden">
                  <div className="w-full h-48 flex items-center justify-center text-black">
                    Нет публикаций
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Нет подарков
          </div>
        )}
      </div>

      {/* Create Post Button */}
      <button className="fixed bottom-20 right-4 bg-yellow-400 text-black rounded-full p-3 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 p-3 flex justify-around">
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Профиль</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Главная</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Поиск</span>
        </button>
        <button className="flex flex-col items-center text-gray-400 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Магазин</span>
        </button>
      </nav>
    </div>
  );
};

// Post Component
const PostItem = ({ post }) => {
  return (
    <div className="post-item bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <img 
          src={post.user?.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
          alt={post.user?.name || "User"} 
          className="w-10 h-10 rounded-full mr-3" 
        />
        <div>
          <h3 className="font-bold">{post.user?.name || "User Name"}</h3>
          <p className="text-xs text-gray-400">{post.created_at || "01.01.2025, 12:00:00"}</p>
        </div>
        {post.type === 'drawing' && (
          <span className="ml-auto text-gray-400">Рисунок</span>
        )}
      </div>
      <div className="mt-3">
        {post.type === 'text' && <p>{post.content}</p>}
        {post.type === 'image' && (
          <img src={post.content} alt="Post" className="w-full rounded-lg" />
        )}
        {post.type === 'drawing' && (
          <div className="w-full bg-white rounded-lg overflow-hidden">
            <img src={post.content} alt="Drawing" className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

// Create Post Modal
const CreatePostModal = ({ isOpen, onClose, onSave }) => {
  const [postType, setPostType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [drawingCanvas, setDrawingCanvas] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Создать публикацию</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="tabs flex mb-4">
          <button 
            className={`flex-1 p-2 text-center ${postType === 'text' ? 'bg-gray-800 rounded-lg' : ''}`}
            onClick={() => setPostType('text')}
          >
            Текст
          </button>
          <button 
            className={`flex-1 p-2 text-center ${postType === 'drawing' ? 'bg-gray-800 rounded-lg' : ''}`}
            onClick={() => setPostType('drawing')}
          >
            Рисунок
          </button>
        </div>

        <div className="content mb-4">
          {postType === 'text' && (
            <textarea
              className="w-full p-3 bg-gray-800 text-white rounded-lg"
              rows="5"
              placeholder="Что у вас нового?"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            ></textarea>
          )}
          {postType === 'drawing' && (
            <div className="bg-white rounded-lg overflow-hidden">
              <CanvasDraw
                ref={canvasDraw => setDrawingCanvas(canvasDraw)}
                brushColor="#000000"
                brushRadius={3}
                lazyRadius={0}
                canvasWidth={350}
                canvasHeight={300}
                hideGrid
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg"
            onClick={() => {
              if (postType === 'text') {
                onSave({ type: 'text', content: textContent });
              } else if (postType === 'drawing' && drawingCanvas) {
                onSave({ type: 'drawing', content: drawingCanvas.getDataURL() });
              }
              onClose();
            }}
          >
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const telegram = useTelegram();

  useEffect(() => {
    // Get user data from Telegram
    if (telegram.user) {
      setUser({
        id: telegram.user.id,
        name: telegram.user.firstName + (telegram.user.lastName ? ` ${telegram.user.lastName}` : ''),
        username: telegram.user.username,
        photo_url: telegram.user.photoUrl,
        posts: []
      });
    } else {
      // Mock user for development
      setUser({
        id: '12345',
        name: 'Daniil Shelesteev',
        username: 'marnitic',
        photo_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        posts: []
      });
    }

    // Load posts from backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [telegram.user]);

  const handleSavePost = async (post) => {
    try {
      const newPost = {
        ...post,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      
      const response = await axios.post(`${API}/posts`, newPost);
      setPosts([response.data, ...posts]);
      
      // Update user's posts
      if (user) {
        setUser({
          ...user,
          posts: [response.data, ...(user.posts || [])]
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="App">
      <UserProfile user={user} />
      
      {/* Create Post Button */}
      <button 
        className="fixed bottom-20 right-4 bg-yellow-400 text-black rounded-full p-3 shadow-lg"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSavePost}
      />
    </div>
  );
}

export default App;
      