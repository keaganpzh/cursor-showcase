/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'macos-blue': '#007AFF',
        'macos-gray': '#F5F5F7',
        'macos-dark': '#1E1E1E',
      },
      backdropBlur: {
        'macos': '20px',
      },
    },
  },
  plugins: [],
}

