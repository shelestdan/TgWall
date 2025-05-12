/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'telegram': '#0088cc',
        'primary': {
          50: '#fffbeb',
          100: '#fff3c4',
          200: '#ffe484',
          300: '#ffd94f',
          400: '#ffcd2a',
          500: '#ffba08',
          600: '#e59400',
          700: '#ad6800',
          800: '#845000',
          900: '#5f3b00',
        },
        'night': {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#7d7d7d',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 186, 8, 0.5)',
        'inner-glow': 'inset 0 0 15px rgba(255, 186, 8, 0.2)',
      },
    },
  },
  plugins: [],
};