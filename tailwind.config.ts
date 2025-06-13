import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'footer-texture': "url('/images/footer_bg.png')",
      },
      fontFamily: {
        primary: ['Impact', ...defaultTheme.fontFamily.sans],
        sans: ['Impact', ...defaultTheme.fontFamily.sans],
        serif: '"Serif Babe"',
        accent: '"1251"',
        mono: '"Monaspace Neon"',
      },
      colors: {
        primary: {
          50: 'rgb(var(--tw-color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--tw-color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--tw-color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--tw-color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--tw-color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--tw-color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--tw-color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--tw-color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--tw-color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--tw-color-primary-900) / <alpha-value>)',
          950: 'rgb(var(--tw-color-primary-950) / <alpha-value>)',
        },
        dark: '#222222',
      },
      spacing: {
        'navigation-height': 'var(--navigation-height)',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': {
            opacity: '0.99',
            filter:
              'drop-shadow(0 0 1px rgba(252, 211, 77)) drop-shadow(0 0 15px rgba(245, 158, 11)) drop-shadow(0 0 1px rgba(252, 211, 77))',
          },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': {
            opacity: '0.4',
            filter: 'none',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-700px 0',
          },
          '100%': {
            backgroundPosition: '700px 0',
          },
        },
        rainbow: {
          '100%, 0%': {
            color: 'rgb(255,0,0)',
          },
          '8%': {
            color: 'rgb(255,127,0)',
          },
          '16%': {
            color: 'rgb(255,255,0)',
          },
          '25%': {
            color: 'rgb(127,255,0)',
          },
          '33%': {
            color: 'rgb(0,255,0)',
          },
          '41%': {
            color: 'rgb(0,255,127)',
          },
          '50%': {
            color: 'rgb(0,255,255)',
          },
          '58%': {
            color: 'rgb(0,127,255)',
          },
          '66%': {
            color: 'rgb(0,0,255)',
          },
          '75%': {
            color: 'rgb(127,0,255)',
          },
          '83%': {
            color: 'rgb(255,0,255)',
          },
          '91%': {
            color: 'rgb(255,0,127)',
          },
        },
      },
      animation: {
        flicker: 'flicker 3s linear infinite',
        shimmer: 'shimmer 1.3s linear infinite',
        rainbow: 'rainbow 2.5s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
