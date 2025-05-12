
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PostItem = ({ post, user }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 20));
  
  const handleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-lg animate-fadeIn">
      {/* Post Header */}
      <div className="p-4 flex items-center">
        <Link to={`/profile/${post.user_id || user?.id}`} className="flex items-center flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
            <img 
              src={user?.photo_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
              alt={user?.name || "User"} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-white">{user?.name || "Пользователь"}</h3>
            <div className="flex items-center">
              <p className="text-xs text-gray-400">{formatDate(post.created_at || new Date())}</p>
              {post.type === 'drawing' && (
                <span className="ml-2 text-xs bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded-full">Рисунок</span>
              )}
            </div>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      {/* Post Content */}
      <div className="w-full">
        {post.type === 'text' && (
          <div className="px-4 pb-3">
            <p className="text-white">{post.content}</p>
          </div>
        )}
        {post.type === 'image' && (
          <img src={post.content} alt="Post" className="w-full" />
        )}
        {post.type === 'drawing' && (
          <div className="w-full bg-white">
            <img src={post.content} alt="Drawing" className="w-full" />
          </div>
        )}
      </div>
      
      {/* Post Footer */}
      <div className="p-4 border-t border-gray-800 flex justify-between">
        <button 
          onClick={handleLike}
          className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-400'}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill={liked ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">{likesCount}</span>
        </button>
        
        <button className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{Math.floor(Math.random() * 10)}</span>
        </button>
        
        <button className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
        
        <button className="flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostItem;
      