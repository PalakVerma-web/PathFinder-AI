/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0A1931',
        primaryViolet: '#4A7FA7',
        primaryIndigo: '#B3CFE5',
        accentAmber: '#F59E0B',
        matchEmerald: '#10B981',
        offWhite: '#F6FAFD',
        secondaryGray: '#B3CFE5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
