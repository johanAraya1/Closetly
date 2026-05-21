/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{ts,tsx}", "./App.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8F8F8",
        surface: "#FFFFFF",
        ink: "#1F1F1F",
        muted: "#D6D3D1",
        violet: "#8B5CF6",
        darkCanvas: "#121212",
        darkSurface: "#1E1E1E",
        darkInk: "#F5F5F5",
        darkViolet: "#A78BFA"
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};
