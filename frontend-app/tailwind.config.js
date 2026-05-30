/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue':    '#020617', // slate-950  — navbar background
        'brand-yellow':  '#d4af37', // royal gold — primary accent
        'brand-red':     '#7c3aed', // royal violet — secondary accent
        'brand-dark':    '#0f1117', // near-black — unified sidebar dark
        'brand-surface': '#f8fafc', // slate-50   — dashboard content bg
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0/0.07), 0 1px 2px -1px rgb(0 0 0/0.05)',
        'card-md': '0 4px 6px -1px rgb(0 0 0/0.07), 0 2px 4px -2px rgb(0 0 0/0.05)',
        'card-lg': '0 10px 20px -3px rgb(0 0 0/0.08), 0 4px 6px -4px rgb(0 0 0/0.04)',
        'inner-top': 'inset 0 1px 0 0 rgb(255 255 255/0.06)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        marquee:  'marquee 25s linear infinite',
        'fade-up': 'fade-up 0.18s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
