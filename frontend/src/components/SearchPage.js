
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'рисунки', 'дизайн', 'telegram', 'мемы', 'подарки'
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for search results
  const mockUsers = [
    {
      id: '1',
      name: 'Алексей Петров',
      username: 'alexeypetrov',
      photo_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: '2',
      name: 'Мария Иванова',
      username: 'mashavanova',
      photo_url: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: '3',
      name: 'Сергей Сидоров',
      username: 'sergsid',
      photo_url: 'https://randomuser.me/api/portraits/men/62.jpg',
    },
    {
      id: '4',
      name: 'Анна Королева',
      username: 'annakoroleva',
      photo_url: 'https://randomuser.me/api/portraits/women/56.jpg',
    },
    {
      id: '5',
      name: 'Дмитрий Волков',
      username: 'dmitryvolkov',
      photo_url: 'https://randomuser.me/api/portraits/men/41.jpg',
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      // Filter mock data based on search query
      const filteredResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      
      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      
      setIsLoading(false);
    }, 500);
  };

  const handleRecentSearch = (term) => {
    setSearchQuery(term);
    // Automatically search with the term
    setIsLoading(true);
    
    setTimeout(() => {
      const filteredResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(term.toLowerCase()) || 
        user.username.toLowerCase().includes(term.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      {/* Search Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black sticky top-0 z-10 p-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Поиск пользователей и постов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button 
            type="submit" 
            className="absolute right-3 top-2.5 bg-yellow-500 text-black p-1 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>

      {/* Search Content */}
      <div className="p-4">
        {/* Recent Searches */}
        {!searchResults.length && !isLoading && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-300 mb-3">Недавние запросы</h2>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <button 
                  key={index} 
                  onClick={() => handleRecentSearch(term)}
                  className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full text-sm hover:bg-gray-700 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-10">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !isLoading && (
          <div>
            <h2 className="text-lg font-medium text-gray-300 mb-3">Результаты поиска</h2>
            <div className="space-y-3">
              {searchResults.map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`} 
                  className="block"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 flex items-center animate-fadeIn transform hover:scale-[1.01] transition-transform">
                    <img 
                      src={user.photo_url} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-700" 
                    />
                    <div className="ml-3">
                      <h3 className="font-medium text-white">{user.name}</h3>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                    </div>
                    <button className="ml-auto bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                      Профиль
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300">Ничего не найдено</h3>
            <p className="text-sm text-gray-500 mt-1">Попробуйте изменить запрос поиска</p>
          </div>
        )}

        {/* Popular Searches (if no search query) */}
        {!searchQuery && !searchResults.length && !isLoading && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-300 mb-3">Популярные профили</h2>
            <div className="grid grid-cols-2 gap-3">
              {mockUsers.slice(0, 4).map(user => (
                <Link 
                  key={user.id} 
                  to={`/profile/${user.id}`} 
                  className="block"
                >
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-3 animate-fadeIn transform hover:scale-[1.01] transition-transform">
                    <div className="flex flex-col items-center">
                      <img 
                        src={user.photo_url} 
                        alt={user.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 mb-2" 
                      />
                      <h3 className="font-medium text-white text-center">{user.name}</h3>
                      <p className="text-gray-400 text-xs text-center">@{user.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
      