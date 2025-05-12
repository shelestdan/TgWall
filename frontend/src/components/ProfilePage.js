
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import { useParams } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use userId from URL or currentUser.id as fallback
        const id = userId || (currentUser ? currentUser.id : null);
        
        if (id) {
          // Fetch user profile
          const userResponse = await axios.get(`${API}/users/${id}`);
          setUser(userResponse.data);
          
          // Fetch user posts
          const postsResponse = await axios.get(`${API}/users/${id}/posts`);
          setPosts(postsResponse.data);
          
          // Fetch user gifts
          const giftsResponse = await axios.get(`${API}/users/${id}/gifts`);
          setGifts(giftsResponse.data);
        } else {
          // If no user ID, use current user data
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-24 mb-3"></div>
          <div className="h-3 bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  // If no user data is available
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl">Пользователь не найден</h2>
          <p className="text-gray-500 mt-2">Профиль недоступен или был удален</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      {/* User Profile */}
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg mx-4 mt-4 p-4 shadow-lg border border-gray-800">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400 p-1">
              <img 
                src={user?.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                alt={user?.name || "User"} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              ★
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">
              {user?.name || "User Name"}
            </h2>
            <p className="text-gray-400">@{user?.username || "username"}</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="mr-2">🎁</span> Отправить подарок
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-transform">
            <span className="mr-2">👥</span> Добавить в друзья
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900 rounded-t-lg mx-4 mt-6">
        <button 
          className={`px-4 py-3 flex-1 text-center font-medium transition-colors ${activeTab === 'posts' ? 'bg-black rounded-t-lg text-yellow-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('posts')}
        >
          Посты
        </button>
        <button 
          className={`px-4 py-3 flex-1 text-center font-medium transition-colors ${activeTab === 'gifts' ? 'bg-black rounded-t-lg text-yellow-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('gifts')}
        >
          Подарки
        </button>
      </div>

      {/* Content */}
      <div className="bg-black mx-4 p-4 rounded-b-lg min-h-[300px] border border-gray-900 border-t-0">
        {activeTab === 'posts' ? (
          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <PostItem key={post.id} post={post} user={user} />
              ))
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 text-center">
                <div className="flex flex-col items-center justify-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium text-gray-300">Нет публикаций</p>
                  <p className="text-sm text-gray-500 mt-1">Здесь будут отображаться посты пользователя</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {gifts && gifts.length > 0 ? (
              gifts.map(gift => (
                <div key={gift.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 animate-fadeIn">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gradient-to-r from-yellow-400 to-amber-600 p-3 rounded-lg mr-4">
                      {gift.type === 'flower' && '🌹'}
                      {gift.type === 'candy' && '🍬'}
                      {gift.type === 'star' && '⭐'}
                      {!['flower', 'candy', 'star'].includes(gift.type) && '🎁'}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Подарок: {gift.type}</h3>
                      <p className="text-gray-400 text-sm">{gift.message || 'Без сообщения'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        От: {gift.sender_name || 'Отправитель'} • {new Date(gift.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 text-center">
                <div className="flex flex-col items-center justify-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0H4" />
                  </svg>
                  <p className="text-lg font-medium text-gray-300">Нет подарков</p>
                  <p className="text-sm text-gray-500 mt-1">Здесь будут отображаться полученные подарки</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
      