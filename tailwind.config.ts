import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c3ff',
          300: '#a5a3ff',
          400: '#8b87ff',
          500: '#6c63ff',
          600: '#5a4ff0',
          700: '#4a3fd6',
          800: '#3d34b0',
          900: '#332d8a',
        },
      },
    },
  },
  plugins: [],
}

export default config
