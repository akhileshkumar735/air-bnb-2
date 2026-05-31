/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#ff385c",
          DEFAULT: "#ff385c",
          dark: "#e61e4d",
        }
      }
    },
  },
  plugins: [],
}
