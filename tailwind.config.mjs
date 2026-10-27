/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#d69135',
          'dark-orange': '#b0752a',
          'light-orange': '#e5ab5e',
          primary: '#233d78',
          flamingo: '#f43f5e',
        },
        ocean: {
          100: '#d5dcee',
          200: '#aebcdd',
          300: '#8197c8',
          400: '#5772ae',
          600: '#2d4581',
          700: '#233d78',
          800: '#1b2f5c',
          900: '#14213f',
          950: '#0c1428',
        },
      },
      fontFamily: {
        primary: ['Montserrat', 'sans-serif'],
        secondary: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'scale-in': 'scaleIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
};
