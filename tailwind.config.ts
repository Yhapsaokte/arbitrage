import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f6f8fb',
        card: '#ffffff',
        primary: '#0f3d68',
        success: '#0f766e',
        warning: '#b45309',
        danger: '#b91c1c',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15,61,104,0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
