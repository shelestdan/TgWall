
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import { Link } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('feed');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch posts
        const postsResponse = await axios.get(`${API}/posts`);
        setPosts(postsResponse.data);
        
        // Here you would fetch users from an API
        // For now using mock data
        setUsers([
          {
            id: '1',
            name: 'Алексей Петров',
            username: 'alexeypetrov',
            photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
            status: 'online'
          },
          {
            id: '2',
            name: 'Мария Иванова',
            username: 'mashavanova',
            photo_url: 'https://randomuser.me/api/portraits/women/44.jpg',
            status: 'offline'
          },
          {
            id: '3',
            name: 'Сергей Сидоров',
            username: 'sergsid',
            photo_url: 'https://randomuser.me/api/portraits/men/62.jpg',
            status: 'online'
          },
        ]);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">TeleWall</h1>
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <span className="text-yellow-400 font-medium">25</span>
              <span className="text-yellow-400 ml-1">★</span>
            </span>
            <button className="bg-gray-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-800 sticky top-16 bg-black z-10">
        <button 
          className={`px-4 py-3 flex-1 text-center transition-colors ${activeSection === 'feed' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
          onClick={() => setActiveSection('feed')}
        >
          Лента
        </button>
        <button 
          className={`px-4 py-3 flex-1 text-center transition-colors ${activeSection === 'friends' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
          onClick={() => setActiveSection('friends')}
        >
          Друзья
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSection === 'feed' ? (
          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <PostItem key={post.id} post={post} user={post.user} />
              ))
            ) : (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-5 text-center">
                <div className="flex flex-col items-center justify-center py-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-lg font-medium text-gray-300">Лента пуста</p>
                  <p className="text-sm text-gray-500 mt-1">Начните следить за друзьями, чтобы видеть их публикации</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`} 
                className="block"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 flex items-center animate-fadeIn transform hover:scale-[1.01] transition-transform">
                  <div className="relative">
                    <img 
                      src={user.photo_url} 
                      alt={user.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-700" 
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                  <button className="ml-auto bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                    Профиль
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
      