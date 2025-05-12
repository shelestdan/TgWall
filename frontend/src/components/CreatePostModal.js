
import React, { useState, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';

const CreatePostModal = ({ isOpen, onClose, onSave }) => {
  const [postType, setPostType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [drawingCanvas, setDrawingCanvas] = useState(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushRadius, setBrushRadius] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef(null);
  
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];
  
  const brushSizes = [1, 3, 5, 8, 12];
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (postType === 'text') {
        if (!textContent.trim()) {
          alert('Пожалуйста, введите текст');
          setIsSubmitting(false);
          return;
        }
        await onSave({ type: 'text', content: textContent });
      } else if (postType === 'drawing' && drawingCanvas) {
        const dataUrl = drawingCanvas.getDataURL();
        await onSave({ type: 'drawing', content: dataUrl });
      }
      setTextContent('');
      if (drawingCanvas) {
        drawingCanvas.clear();
      }
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Ошибка при создании поста');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClearDrawing = () => {
    if (drawingCanvas) {
      drawingCanvas.clear();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg w-full max-w-md border border-gray-800 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-200 to-yellow-500 text-transparent bg-clip-text">
            Создать публикацию
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="tabs flex border-b border-gray-800">
          <button 
            className={`flex-1 p-3 text-center ${postType === 'text' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setPostType('text')}
          >
            Текст
          </button>
          <button 
            className={`flex-1 p-3 text-center ${postType === 'drawing' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setPostType('drawing')}
          >
            Рисунок
          </button>
        </div>

        <div className="p-4">
          {postType === 'text' && (
            <div>
              <textarea
                className="w-full p-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                rows="5"
                placeholder="Что у вас нового?"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              ></textarea>
              <div className="text-right text-xs text-gray-500 mt-1">
                {textContent.length}/1000 символов
              </div>
            </div>
          )}
          
          {postType === 'drawing' && (
            <div>
              <div className="bg-white rounded-lg overflow-hidden shadow-inner border border-gray-700">
                <CanvasDraw
                  ref={(canvasDraw) => {
                    setDrawingCanvas(canvasDraw);
                    canvasRef.current = canvasDraw;
                  }}
                  brushColor={brushColor}
                  brushRadius={brushRadius}
                  lazyRadius={0}
                  canvasWidth={350}
                  canvasHeight={300}
                  hideGrid
                  className="w-full"
                />
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-300 text-sm">Цвет кисти:</h3>
                  <button 
                    onClick={handleClearDrawing}
                    className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded hover:bg-gray-700"
                  >
                    Очистить
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-8 h-8 rounded-full ${color === '#FFFFFF' ? 'border border-gray-500' : ''} ${color === brushColor ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
                
                <h3 className="text-gray-300 text-sm mb-2">Размер кисти:</h3>
                <div className="flex items-center gap-2">
                  {brushSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setBrushRadius(size)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${brushRadius === size ? 'border-yellow-400 text-yellow-400' : 'border-gray-600 text-gray-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-800">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-5 py-2 rounded-lg font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 transition-transform'}`}
          >
            {isSubmitting ? 'Публикация...' : 'Опубликовать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
      