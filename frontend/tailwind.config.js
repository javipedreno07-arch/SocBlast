/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soc-dark': '#0A0F1E',
        'soc-blue': '#3B82F6',
        'soc-purple': '#7C3AED',
        'soc-mid': '#1E3A5F',
        'soc-green': '#10B981',
        'soc-red': '#EF4444',
        'soc-gold': '#F59E0B',
      }
    },
  },
  plugins: [],
}