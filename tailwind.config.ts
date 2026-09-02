import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9ee',
          100: '#e0f0d6',
          200: '#c3e1b0',
          300: '#9ccb7f',
          400: '#71ae54',
          500: '#4f9636',
          600: '#41852a',
          700: '#336a21',
          800: '#2a541c',
          900: '#234519',
          950: '#10250c',
        },
        amber: {
          500: '#b8860b',
          600: '#9a6f09',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16, 37, 12, 0.04), 0 8px 24px rgba(16, 37, 12, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
