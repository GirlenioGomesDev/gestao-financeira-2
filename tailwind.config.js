/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#FDFAF3',
        surface: '#FFFFFF',
        ink: '#2F2A25',
        muted: '#7B7167',
        line: '#E9DDC7',
        primary: '#2F8F6B',
        primaryDark: '#1E7055',
        coral: '#E96C5F',
        sun: '#F5B84B',
        sky: '#7DB7D9',
        lavender: '#9A86C8',
        positive: '#D4EDDF',
        negative: '#FDECEA',
        warning: '#FEF3DC',
      },
      fontFamily: {
        display: ['PatrickHand'],
        body: ['Nunito'],
      },
      borderRadius: {
        paper: '8px',
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        fab: '0 4px 16px rgba(31,112,85,0.35)',
      },
    },
  },
  plugins: [],
};
