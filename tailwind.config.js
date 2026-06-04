/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#8098f9',
          500: '#6175f4',
          600: '#4a55e8',
          700: '#3c43d0',
          800: '#3239a8',
          900: '#2e3484',
          950: '#1c1f52',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fc',
          100: '#f1f3f8',
          200: '#e4e8f2',
          300: '#d0d6e8',
          800: '#1e2235',
          900: '#141728',
          950: '#0d0f1c',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 4px 16px 0 rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 8px 0 rgb(0 0 0 / 0.06), 0 12px 32px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
}