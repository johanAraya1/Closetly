/**
 * Design tokens — copiados de Closetly_FE
 * Usar estos valores directamente en StyleSheet.create() cuando no alcance con NativeWind.
 */

export const COLORS = {
  primary: "#62D9C7",
  secondary: "#6A4BFF",
  neutral: "#F4F5F7",
  primaryDark: "#4FBFAD",
  secondaryDark: "#5639E5",
  white: "#FFFFFF",
  black: "#000000",
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
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 9999,
} as const;

/* === LIGHT SCHEME (para ThemeContext) === */
export const lightScheme = {
  primary: "#62D9C7",
  secondary: "#6A4BFF",
  background: "#F4F5F7",
  surface: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
};

/* === DARK SCHEME (para ThemeContext) === */
export const darkScheme = {
  primary: "#4FBFAD",
  secondary: "#5639E5",
  background: "#111827",
  surface: "#1F2937",
  text: "#F9FAFB",
  textSecondary: "#9CA3AF",
  border: "#374151",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
};
