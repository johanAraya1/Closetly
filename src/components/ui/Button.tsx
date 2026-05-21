import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-violet",
  secondary: "bg-surface border border-muted",
  ghost: "bg-transparent",
  danger: "bg-red-600"
};

const textClassName: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-ink",
  ghost: "text-ink",
  danger: "text-white"
};

export const Button = ({ title, variant = "primary", loading, disabled, className, ...props }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled || loading}
    className={cn(
      "min-h-12 items-center justify-center rounded-card px-4",
      variantClassName[variant],
      (disabled || loading) && "opacity-60",
      className
    )}
    {...props}
  >
    {loading ? (
      <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? "#1F1F1F" : "#FFFFFF"} />
    ) : (
      <Text className={cn("text-center text-base font-semibold", textClassName[variant])}>{title}</Text>
    )}
  </Pressable>
);
