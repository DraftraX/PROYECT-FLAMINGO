/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        flamingo: {
          lavender: '#EAE3F2',
          'lavender-light': '#F5F1FA',
          plum: '#361D42',
          'plum-dark': '#23112B',
          pink: '#EE6B96',
          'pink-soft': '#F48FB1',
          olive: '#515B1B',
        },
        brand: {
          orange: '#d69135',
          'dark-orange': '#b0752a',
          'light-orange': '#e5ab5e',
          primary: '#361D42',
          flamingo: '#EE6B96',
        },
        ocean: {
          100: '#EAE3F2',
          200: '#d5dcee',
          300: '#8197c8',
          400: '#5772ae',
          600: '#2d4581',
          700: '#233d78',
          800: '#1b2f5c',
          900: '#23112B',
          950: '#0c1428',
        },
      },
      fontFamily: {
        serif: ["'Geista Mond'", "'Cormorant Garamond'", 'Georgia', 'serif'],
        geista: ["'Geista Mond'", "'Cormorant Garamond'", 'Georgia', 'serif'],
        sans: ["'DM Sans'", 'sans-serif'],
        dm: ["'DM Sans'", 'sans-serif'],
        primary: ["'Geista Mond'", "'Cormorant Garamond'", 'serif'],
        secondary: ["'DM Sans'", 'sans-serif'],
      },
      screens: {
        short: { raw: '(max-height: 500px)' },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate3d(0, 0px, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -10px, 0) rotate(2deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'scale-in': 'scaleIn 0.35s ease-out forwards',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
