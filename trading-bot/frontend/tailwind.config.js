/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Mode
        light: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          text: '#1f2937',
          accent: '#e11d48',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          border: '#e2e8f0',
        },
        // Dark Mode
        dark: {
          primary: '#111827',
          secondary: '#1f2937',
          tertiary: '#374151',
          text: '#f9fafb',
          accent: '#e11d48',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          border: '#4b5563',
        },
        // Red Alert Mode
        alert: {
          primary: '#1e0b0b',
          secondary: '#2d1212',
          tertiary: '#3d1818',
          text: '#ffebeb',
          accent: '#ff1f3d',
          success: '#ff6b6b',
          warning: '#ff8e53',
          error: '#ff4757',
          border: '#ff6b6b',
        },
        // Trading specific colors
        bull: '#10b981',
        bear: '#ef4444',
        neutral: '#6b7280',
        'trading': {
          'primary': '#1f2937',
          'secondary': '#374151',
          'accent': '#10b981',
          'danger': '#ef4444',
          'warning': '#f59e0b',
          'success': '#22c55e',
          'info': '#3b82f6',
          'dark': '#111827',
          'light': '#f9fafb'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(225, 29, 72, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(225, 29, 72, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'source-code-pro', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
