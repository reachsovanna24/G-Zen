/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Emerald green brand accent
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        khmer: {
          red: '#D91B24',
          blue: '#002B7F',
          gold: '#F4B41A',
        },
        dark: {
          900: '#090D16',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
      }
    },
  },
  plugins: [],
};
