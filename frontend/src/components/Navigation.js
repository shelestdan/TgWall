
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || 
          (path !== '/' && location.pathname.startsWith(path));
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pt-3 pb-4 px-3 flex justify-around z-20">
      <Link 
        to="/profile" 
        className={`flex flex-col items-center ${isActive('/profile') ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/profile') ? 2 : 1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs mt-1">Профиль</span>
      </Link>
      
      <Link 
        to="/" 
        className={`flex flex-col items-center ${isActive('/') ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/') ? 2 : 1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">Главная</span>
      </Link>
      
      <Link 
        to="/search" 
        className={`flex flex-col items-center ${isActive('/search') ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/search') ? 2 : 1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-xs mt-1">Поиск</span>
      </Link>
      
      <Link 
        to="/store" 
        className={`flex flex-col items-center ${isActive('/store') ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/store') ? 2 : 1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span className="text-xs mt-1">Магазин</span>
      </Link>
    </nav>
  );
};

export default Navigation;
      