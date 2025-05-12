
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import ProfilePage from "./components/ProfilePage";
import HomePage from "./components/HomePage";
import SearchPage from "./components/SearchPage";
import StorePage from "./components/StorePage";
import Navigation from "./components/Navigation";
import CreatePostModal from "./components/CreatePostModal";

// Constants
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Initialize Telegram Mini App
let tg = window.Telegram?.WebApp;

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    // Initialize Telegram Mini App if available
    if (tg) {
      tg.ready();
      
      // Get user data from Telegram
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const telegramUser = tg.initDataUnsafe.user;
        
        // Create user in our backend
        const createOrUpdateUser = async () => {
          try {
            const userData = {
              telegram_id: telegramUser.id.toString(),
              username: telegramUser.username,
              name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
              photo_url: telegramUser.photo_url,
            };
            
            const response = await axios.post(`${API}/users`, userData);
            setUser(response.data);
          } catch (error) {
            console.error('Error saving user data:', error);
            // Fallback to local user data
            setUser({
              id: telegramUser.id.toString(),
              telegram_id: telegramUser.id.toString(),
              name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
              username: telegramUser.username,
              photo_url: telegramUser.photo_url,
            });
          } finally {
            setIsLoading(false);
          }
        };
        
        createOrUpdateUser();
      } else {
        // Mock user for development
        createMockUser();
      }
    } else {
      // Mock user for development when not in Telegram
      createMockUser();
    }
  }, []);
  
  const createMockUser = async () => {
    try {
      const mockUser = {
        telegram_id: '12345',
        name: 'Дмитрий Волков',
        username: 'dmitryvolkov',
        photo_url: 'https://randomuser.me/api/portraits/men/41.jpg',
      };
      
      const response = await axios.post(`${API}/users`, mockUser);
      setUser(response.data);
    } catch (error) {
      console.error('Error creating mock user:', error);
      setUser({
        id: '12345',
        telegram_id: '12345',
        name: 'Дмитрий Волков',
        username: 'dmitryvolkov',
        photo_url: 'https://randomuser.me/api/portraits/men/41.jpg',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePost = async (post) => {
    try {
      if (!user) {
        alert('Необходимо авторизоваться для публикации');
        return;
      }
      
      const newPost = {
        ...post,
        user_id: user.id,
      };
      
      const response = await axios.post(`${API}/posts`, newPost);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-32 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-black text-white relative pb-20">
        <Routes>
          <Route path="/" element={<HomePage currentUser={user} />} />
          <Route path="/profile" element={<ProfilePage currentUser={user} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUser={user} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Navigation />
        
        {/* Create Post Button */}
        <button 
          className="fixed bottom-20 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full p-3 shadow-lg z-30 transform hover:scale-110 transition-transform"
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
    </BrowserRouter>
  );
}

export default App;
      