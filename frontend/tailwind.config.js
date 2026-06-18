/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        slate: {
          50: 'var(--slate-50)',
          100: 'var(--slate-100)',
          200: 'var(--slate-200)',
          300: 'var(--slate-300)',
          400: 'var(--slate-400)',
          500: 'var(--slate-500)',
          600: 'var(--slate-600)',
          700: 'var(--slate-700)',
          800: 'var(--slate-800)',
          900: 'var(--slate-900)',
        },
        gray: {
          50: 'var(--gray-50)',
        },
        clinical: {
          50: 'var(--clinical-50)',
          100: 'var(--clinical-100)',
          200: 'var(--clinical-200)',
          500: 'var(--clinical-500)',
          600: 'var(--clinical-600)',
          700: 'var(--clinical-700)',
        },
        health: {
          50: 'var(--health-50)',
          100: 'var(--health-100)',
          500: 'var(--health-500)',
          600: 'var(--health-600)',
        },
        amber: {
          50: 'var(--amber-50)',
          100: 'var(--amber-100)',
          500: 'var(--amber-500)',
          600: 'var(--amber-600)',
        },
        red: {
          50: 'var(--red-50)',
          500: 'var(--red-500)',
          600: 'var(--red-600)',
          700: 'var(--red-700)',
        },
        blue: {
          50: 'var(--blue-50)',
          600: 'var(--blue-600)',
          700: 'var(--blue-700)',
        },
        purple: {
          50: 'var(--purple-50)',
          600: 'var(--purple-600)',
        },
        white: 'var(--color-white)',
        black: 'var(--color-black)',
      },
    },
  },
  plugins: [],
}
