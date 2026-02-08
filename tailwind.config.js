/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './App.*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './navigation/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4C7A6C',
          50: '#F4F7F6',
          100: '#E9EFEB',
          200: '#C7D7D2',
          300: '#A5BFB9',
          400: '#83A79F',
          500: '#4C7A6C',
          600: '#446E61',
          700: '#3D6257',
          800: '#35564C',
          900: '#2E4A42',
        },
      },
      fontFamily: {
        sans: ['CalSans-Regular'],
        calsans: ['CalSans-Regular'],
      },
    },
  },
  plugins: [],
};
