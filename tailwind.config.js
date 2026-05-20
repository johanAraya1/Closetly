/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8F8F8",
        surface: "#FFFFFF",
        primary: "#8B5CF6",
        primaryDark: "#A78BFA",
        secondary: "#D6D3D1",
        text: "#1F1F1F",
        textDark: "#F5F5F5"
      }
    }
  },
  plugins: []
};
