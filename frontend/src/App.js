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
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"; // Provide a default for local dev
const API_BASE_URL = `${BACKEND_URL}/api`;

// Initialize Telegram Mini App
const tg = window.Telegram?.WebApp;

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [telegramInitData, setTelegramInitData] = useState(null);

  useEffect(() => {
    if (tg) {
      tg.ready();
      // Expand the viewport to full height
      tg.expand(); 
      // Store the raw initData string
      if (tg.initData) {
        setTelegramInitData(tg.initData);
      } else {
        console.warn("Telegram WebApp initData is not available.");
        // Fallback to mock user if initData is missing even if tg object exists
        initializeMockUser();
      }
    } else {
      // Not running in Telegram environment
      console.log("Not in Telegram environment, using mock user.");
      initializeMockUser();
    }
  }, []);

  useEffect(() => {
    if (telegramInitData) {
      // Authenticate with backend using the full initData string
      const authenticateUser = async () => {
        setIsLoading(true);
        try {
          console.log("Sending initData to backend:", telegramInitData);
          const response = await axios.post(`${API_BASE_URL}/auth/telegram_login`, {
            init_data_str: telegramInitData,
          });
          setUser(response.data); // response.data should be the UserProfile object
          console.log("User authenticated:", response.data);
        } catch (error) {
          console.error("Error authenticating user with backend:", error.response ? error.response.data : error.message);
          // Handle auth error, maybe show an error message to the user
          // For now, we don't set a user, so parts of the app might be restricted
          setUser(null); 
        } finally {
          setIsLoading(false);
        }
      };
      authenticateUser();
    } else if (!tg) { // If not in telegram and no initData, mock user is already handled by initializeMockUser
      // This condition ensures we don't try to authenticate if initData was never set
      // and we are not in a Telegram environment (where mock user is used).
    }
  }, [telegramInitData]);

  const initializeMockUser = async () => {
    console.log("Initializing mock user for development.");
    setIsLoading(true);
    try {
      // The mock user creation on backend might be deprecated or changed.
      // For robust local dev, frontend can just use a mock object directly if backend call fails or is not desired.
      const mockUserData = {
        id: "mock-user-12345", // Internal ID
        telegram_id: "123456789", // Mock Telegram ID
        name: "Mock Dev User",
        username: "mockdevuser",
        photo_url: "https://randomuser.me/api/portraits/men/75.jpg",
        description: "I am a mock user for development purposes.",
        privacy: { wall_visibility: "all", can_post: "all" },
        stars_balance: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(mockUserData);
      console.log("Mock user set:", mockUserData);
    } catch (error) {
      console.error("Error setting mock user:", error);
      setUser(null); // Fallback to no user if mock setup fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePost = async (post) => {
    if (!user || !user.id) {
      alert("User not loaded or missing ID. Cannot create post.");
      console.error("User not loaded or missing ID:", user);
      throw new Error("User not loaded or missing ID.");
    }
    try {
      const newPost = {
        ...post,
        user_id: user.id, // Use the internal user ID from UserProfile
      };
      const response = await axios.post(`${API_BASE_URL}/posts`, newPost);
      // Optionally, update local state or trigger a refresh of posts
      return response.data;
    } catch (error) {
      console.error("Error creating post:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  if (isLoading && !user) { // Show loading only if user is not yet set
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-32 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-24"></div>
          <div>Loading User Data...</div>
        </div>
      </div>
    );
  }
  
  // If not loading and no user (e.g. auth failed and no mock user for some reason)
  // You might want a specific screen here, or allow limited access.
  // For now, if user is null, some pages might not work correctly.

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-black text-white relative pb-20 font-manrope">
        <Routes>
          <Route path="/" element={<HomePage currentUser={user} />} />
          {/* Pass telegramInitData to ProfilePage if it needs to make user-specific calls 
              or if user object might not be fully populated initially */}
          <Route path="/profile" element={<ProfilePage currentUser={user} telegramInitData={telegramInitData} />} />
          <Route path="/profile/:userId" element={<ProfilePage currentUser={user} telegramInitData={telegramInitData} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/store" element={<StorePage currentUser={user} telegramInitData={telegramInitData} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {user && <Navigation currentUser={user} />}
        
        {user && (
          <button 
            className="fixed bottom-24 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-full p-4 shadow-lg z-30 transform hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Create Post"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
        
        {user && (
          <CreatePostModal 
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSavePost}
            currentUser={user}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;

