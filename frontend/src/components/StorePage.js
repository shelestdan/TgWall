import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API_BASE_URL = `${BACKEND_URL}/api`;
const tg = window.Telegram?.WebApp;

const StorePage = ({ currentUser, telegramInitData }) => {
  const [activeTab, setActiveTab] = useState('brushes'); // Default to brushes or fetch dynamically
  const [storeItems, setStoreItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseStatus, setPurchaseStatus] = useState(''); // For displaying messages like 'Purchase successful!'

  const fetchStoreItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Later, filter items by activeTab on the backend or fetch all and filter on frontend
      const response = await axios.get(`${API_BASE_URL}/store_items?active_only=true`);
      setStoreItems(response.data || []);
    } catch (err) {
      console.error('Error fetching store items:', err.response ? err.response.data : err.message);
      setError('Не удалось загрузить товары. Попробуйте позже.');
      setStoreItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreItems();
  }, [fetchStoreItems]);

  const handlePurchase = async (itemId) => {
    if (!tg) {
      alert('Эта функция доступна только в приложении Telegram.');
      return;
    }
    if (!currentUser || !currentUser.telegram_id) {
        alert('Пожалуйста, войдите в систему, чтобы совершать покупки.');
        // Optionally, trigger re-authentication if initData is available
        // if (telegramInitData) { /* re-auth logic */ }
        return;
    }

    setPurchaseStatus(`Обработка покупки товара ID: ${itemId}...`);
    try {
      // Backend needs to identify the user. 
      // This could be done by sending initData again, or if backend uses sessions/JWTs from initial login.
      // For simplicity, if your backend /create_invoice_link can re-validate initData or uses a session, great.
      // Otherwise, you might need to pass telegramInitData or a session token.
      // The backend `create_invoice_link` was defined with a dummy `current_user_tg_id` dependency.
      // This needs to be replaced with actual authentication. For now, we assume backend handles it.
      // Let's assume the backend will use the initData passed for authentication for this endpoint as well.
      // We need to ensure the backend endpoint is set up to receive and validate it.
      // For now, I will pass the telegramInitData in the request to the backend.
      
      const response = await axios.post(`${API_BASE_URL}/payments/create_invoice_link`, 
        { store_item_id: itemId }, 
        {
          headers: {
            // If you implemented JWT tokens after login, send it here:
            // 'Authorization': `Bearer ${your_jwt_token}`
            // If your backend re-validates initData for each protected call:
            'X-Telegram-Init-Data': telegramInitData 
          }
        }
      );
      
      const { invoice_url, payload } = response.data;
      console.log("Received invoice URL:", invoice_url, "Payload:", payload);

      tg.openInvoice(invoice_url, (status) => {
        console.log("Invoice status:", status);
        setPurchaseStatus(`Статус платежа: ${status}`);
        if (status === 'paid') {
          setPurchaseStatus('Покупка успешно совершена! Товар добавлен в ваш инвентарь.');
          // TODO: Optionally, refresh user inventory or store items if needed
          // fetchUserInventory(); // You'd need to implement this
        } else if (status === 'cancelled') {
          setPurchaseStatus('Покупка отменена.');
        } else if (status === 'failed') {
          setPurchaseStatus('Ошибка платежа. Пожалуйста, попробуйте еще раз.');
        } else if (status === 'pending') {
          setPurchaseStatus('Платеж в обработке...');
        }
      });
    } catch (err) {
      console.error('Error creating invoice link:', err.response ? err.response.data : err.message);
      setPurchaseStatus(`Ошибка покупки: ${err.response?.data?.detail || err.message}`);
      alert(`Ошибка покупки: ${err.response?.data?.detail || err.message}`);
    }
  };

  const renderItems = () => {
    if (isLoading) return <p className="text-center py-10">Загрузка товаров...</p>;
    if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
    
    const itemsToDisplay = storeItems.filter(item => {
        if (activeTab === 'all') return true;
        return item.item_type === activeTab;
    });

    if (itemsToDisplay.length === 0) {
        return <p className="text-center py-10">В этой категории пока нет товаров.</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {itemsToDisplay.map(item => (
          <div key={item.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-lg animate-fadeIn flex flex-col">
            <div className="h-36 flex items-center justify-center bg-gradient-to-r from-indigo-900 to-purple-900 p-2">
              <img src={item.image_url || 'https://via.placeholder.com/150?text=No+Image'} alt={item.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-md font-bold mb-1">{item.name}</h3>
              <p className="text-gray-400 text-xs mt-1 h-10 overflow-hidden flex-grow">{item.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="flex items-center">
                  <span className="text-yellow-400 font-bold text-lg">{item.price_stars}</span>
                  <span className="text-yellow-400 ml-1 text-lg">★</span>
                </span>
                <button 
                  onClick={() => handlePurchase(item.id)}
                  disabled={!tg || !currentUser} // Disable if not in TG or no user
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium px-3 py-1.5 rounded-lg text-sm transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Купить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Define available tabs based on unique item_types from fetched items, or a predefined list
  const availableTabs = storeItems.length > 0 
    ? ['all', ...new Set(storeItems.map(item => item.item_type))]
    : ['all', 'gifts', 'brushes', 'themes']; // Fallback tabs

  return (
    <div className="bg-black text-white min-h-screen pb-24 pt-4 font-manrope">
      <div className="bg-gradient-to-b from-purple-900 to-black p-5 text-center sticky top-0 z-20 shadow-lg">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">Магазин TeleWall</h1>
        <p className="text-gray-300 mt-1 text-sm">Подарки, кисти и темы для вашего профиля</p>
        {currentUser && (
          <div className="flex items-center justify-center mt-3">
            <span className="flex items-center bg-black bg-opacity-40 px-4 py-2 rounded-full shadow">
              <span className="text-yellow-400 font-bold text-xl">{currentUser.stars_balance !== undefined ? currentUser.stars_balance : "--"}</span>
              <span className="text-yellow-400 ml-1.5 text-xl">★</span>
              <span className="text-gray-300 ml-2.5 text-xs">доступно</span>
            </span>
          </div>
        )}
      </div>

      {purchaseStatus && (
        <div className="p-3 my-3 mx-4 rounded-md bg-blue-600 text-white text-center text-sm">
          {purchaseStatus}
        </div>
      )}

      <div className="flex bg-gray-900 sticky top-[130px] z-10 overflow-x-auto whitespace-nowrap no-scrollbar shadow-md mb-1">
        {availableTabs.map(tabName => (
          <button 
            key={tabName}
            className={`px-5 py-3 text-sm font-medium flex-shrink-0 transition-colors ${activeTab === tabName ? 'text-yellow-400 border-b-2 border-yellow-400 bg-gray-800' : 'text-gray-400 hover:text-yellow-300'}`}
            onClick={() => setActiveTab(tabName)}
          >
            {tabName === 'all' ? 'Все' : tabName.charAt(0).toUpperCase() + tabName.slice(1) /* Capitalize */}
          </button>
        ))}
      </div>

      <div className="p-4">
        {renderItems()}
      </div>

      {/* TODO: Add sections for "User Inventory" and "How to get stars" if needed */}
      <div className="mx-4 my-8 p-4 bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-yellow-400">Как пополнить баланс звезд?</h3>
        <p className="text-gray-300 text-sm">
          Звезды можно будет приобрести через специальные предложения или получить за активность в приложении (функционал в разработке).
          На данный момент, для тестирования, ваш баланс может быть установлен администратором.
        </p>
      </div>
    </div>
  );
};

export default StorePage;

