/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'indigo-deep': '#080C68',
        'indigo': '#24348A',
        'cyan': '#00A9E0',
        'cyan-light': '#EEF9FF',
        'cyan-bg': '#DDF5FD',
        'text-gray': '#52617A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}