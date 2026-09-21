/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shibuya: {
          accent: '#8C4580',
          dark: '#032326',
          header: '#06402F',
          card: '#125938',
          cardLight: '#308C50',
          bg: '#F7F7E6',
          textDark: '#000000',
          textLight: '#FFFFFF',
        }
      },
      fontFamily: {
        serif: ['"PT Serif Caption"', 'Neuton', '"Bona Nova SC"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
