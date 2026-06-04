/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{ts,tsx}", "./App.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Closetly brand — copiado exactamente de Closetly_FE
        primary: "#62D9C7",
        "primary-dark": "#4FBFAD",
        secondary: "#6A4BFF",
        "secondary-dark": "#5639E5",

        // Canvas / background general
        canvas: "#F4F5F7",
        surface: "#FFFFFF",
        ink: "#111827",
        "ink-muted": "#6B7280",
        muted: "#E5E7EB",
        "muted-light": "#F3F4F6",

        // Escala de grises completa
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },

        // Semánticos
        error: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",

        // Dark mode
        darkCanvas: "#111827",
        darkSurface: "#1F2937",
        darkInk: "#F9FAFB",
        darkMuted: "#374151",
        darkPrimary: "#4FBFAD",
        darkSecondary: "#5639E5",
      },
      borderRadius: {
        card: "8px",
        modal: "16px",
        pill: "9999px",
      },
      fontFamily: {
        sans: undefined, // usa la del sistema por defecto (SF Pro / Roboto)
      },
    },
  },
  plugins: [],
};
