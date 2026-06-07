/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FFFDF5', // cream page background
        ink: '#111111', // borders + text
        primary: { DEFAULT: '#FFD23F', fg: '#111111' }, // sunny yellow
        pink: '#FF5C8A',
        info: '#4DA3FF',
        success: '#7BD88F',
        danger: '#FF5C5C',
        muted: '#F4F1E8',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Hard, offset shadows — the core of the neobrutalist look.
      boxShadow: {
        neo: '4px 4px 0 0 #111111',
        'neo-sm': '2px 2px 0 0 #111111',
        'neo-lg': '6px 6px 0 0 #111111',
      },
    },
  },
  plugins: [],
};
