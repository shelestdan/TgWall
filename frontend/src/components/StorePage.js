
import React, { useState } from 'react';

const StorePage = () => {
  const [activeTab, setActiveTab] = useState('gifts');
  
  // Mock data for store items
  const gifts = [
    {
      id: 'gift1',
      name: 'Букет роз',
      description: 'Красивый анимированный букет для особого человека',
      price: 50,
      image: 'https://cdn-icons-png.flaticon.com/512/4213/4213732.png',
      animation: 'falling_petals'
    },
    {
      id: 'gift2',
      name: 'Звездопад',
      description: 'Эффектная анимация звездопада на стене получателя',
      price: 100,
      image: 'https://cdn-icons-png.flaticon.com/512/6002/6002029.png',
      animation: 'star_shower'
    },
    {
      id: 'gift3',
      name: 'Золотое сердце',
      description: 'Анимированное пульсирующее сердце',
      price: 75,
      image: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
      animation: 'beating_heart'
    },
    {
      id: 'gift4',
      name: 'Конфетти',
      description: 'Яркий взрыв конфетти на стене получателя',
      price: 25,
      image: 'https://cdn-icons-png.flaticon.com/512/6647/6647240.png',
      animation: 'confetti_explosion'
    },
  ];
  
  const brushes = [
    {
      id: 'brush1',
      name: 'Неоновая кисть',
      description: 'Светящиеся неоновые линии для ваших рисунков',
      price: 150,
      image: 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png',
    },
    {
      id: 'brush2',
      name: 'Акварельная кисть',
      description: 'Создавайте эффект акварельной живописи',
      price: 200,
      image: 'https://cdn-icons-png.flaticon.com/512/5110/5110725.png',
    },
    {
      id: 'brush3',
      name: 'Радужная кисть',
      description: 'Рисуйте линии с переливающимися цветами радуги',
      price: 250,
      image: 'https://cdn-icons-png.flaticon.com/512/4662/4662973.png',
    },
  ];
  
  const themes = [
    {
      id: 'theme1',
      name: 'Ночное небо',
      description: 'Темная тема с анимированными звездами и луной',
      price: 300,
      image: 'https://cdn-icons-png.flaticon.com/512/2949/2949022.png',
    },
    {
      id: 'theme2',
      name: 'Киберпанк',
      description: 'Футуристический стиль с неоновыми элементами',
      price: 350,
      image: 'https://cdn-icons-png.flaticon.com/512/2357/2357323.png',
    },
    {
      id: 'theme3',
      name: 'Ретро волна',
      description: 'Стильная тема в эстетике 80-х годов',
      price: 275,
      image: 'https://cdn-icons-png.flaticon.com/512/5266/5266866.png',
    },
  ];

  const renderItems = () => {
    let items;
    
    switch (activeTab) {
      case 'gifts':
        items = gifts;
        break;
      case 'brushes':
        items = brushes;
        break;
      case 'themes':
        items = themes;
        break;
      default:
        items = gifts;
    }
    
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-lg animate-fadeIn">
            <div className="h-32 flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900 p-4">
              <img src={item.image} alt={item.name} className="h-20 w-20 object-contain" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-gray-400 text-sm mt-1 h-10 overflow-hidden">{item.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="flex items-center">
                  <span className="text-yellow-400 font-bold">{item.price}</span>
                  <span className="text-yellow-400 ml-1">★</span>
                </span>
                <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium px-3 py-1 rounded-lg text-sm transform hover:scale-105 transition-transform">
                  Купить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-black text-white min-h-screen pb-20">
      {/* Store Header */}
      <div className="bg-gradient-to-b from-purple-900 to-black p-6 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">Магазин TeleWall</h1>
        <p className="text-gray-300 mt-2">Подарки, кисти и темы для вашего профиля</p>
        <div className="flex items-center justify-center mt-3">
          <span className="flex items-center bg-black bg-opacity-30 px-4 py-2 rounded-full">
            <span className="text-yellow-400 font-bold text-lg">270</span>
            <span className="text-yellow-400 ml-1">★</span>
            <span className="text-gray-300 ml-2 text-sm">доступно</span>
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-gray-900 sticky top-0 z-10">
        <button 
          className={`px-4 py-3 flex-1 text-center transition-colors ${activeTab === 'gifts' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('gifts')}
        >
          Подарки
        </button>
        <button 
          className={`px-4 py-3 flex-1 text-center transition-colors ${activeTab === 'brushes' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('brushes')}
        >
          Кисти
        </button>
        <button 
          className={`px-4 py-3 flex-1 text-center transition-colors ${activeTab === 'themes' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('themes')}
        >
          Темы
        </button>
      </div>

      {/* Store Items */}
      <div className="p-4">
        {renderItems()}
      </div>

      {/* Promotion Banner */}
      <div className="mx-4 my-6">
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold">Premium Pack</h3>
              <p className="text-gray-300 text-sm mt-1">Все кисти и темы по специальной цене</p>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium px-4 py-2 rounded-lg text-sm mt-3 transform hover:scale-105 transition-transform">
                Купить за 600 ★
              </button>
            </div>
            <div className="w-20 h-20 flex items-center justify-center bg-black bg-opacity-30 rounded-full ml-4">
              <span className="text-3xl">✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to get stars */}
      <div className="mx-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-2">Как получить звезды?</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center bg-yellow-400 text-black rounded-full mr-2 text-xs">✓</span>
              <span>Ежедневный бонус: 5 звезд</span>
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center bg-yellow-400 text-black rounded-full mr-2 text-xs">✓</span>
              <span>Публикация постов: 2 звезды за пост</span>
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center bg-yellow-400 text-black rounded-full mr-2 text-xs">✓</span>
              <span>Рисунки: 5 звезд за каждый рисунок</span>
            </li>
            <li className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center bg-yellow-400 text-black rounded-full mr-2 text-xs">$</span>
              <span>Купить напрямую через Telegram Payments</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
      