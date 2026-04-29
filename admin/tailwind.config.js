/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': "#ec4899",
        'secondary': "#db2777",
        'accent': "#f9a8d4",
        'light': "#fce7f3",
      }
    },
  },
  plugins: [],
}
