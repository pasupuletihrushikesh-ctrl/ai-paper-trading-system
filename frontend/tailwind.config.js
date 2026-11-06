/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: '#111827',
        cardBorder: '#1F2937',
        accentBlue: '#3B82F6',
        accentGreen: '#10B981',
        accentRed: '#EF4444',
        accentYellow: '#F59E0B',
        accentPurple: '#8B5CF6'
      }
    },
  },
  plugins: [],
}
