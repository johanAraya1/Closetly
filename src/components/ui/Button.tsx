import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
};

export const Button = ({
  title,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  fullWidth,
  icon,
  className,
  ...props
}: ButtonProps) => {
  const isOutlineOrGhost = variant === "outline" || variant === "ghost";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center rounded-card",
        // Variants
        variant === "primary" && "bg-primary",
        variant === "secondary" && "border-2 border-primary bg-white",
        variant === "outline" && "border-2 border-primary bg-transparent",
        variant === "ghost" && "bg-transparent",
        variant === "danger" && "border-2 border-error bg-red-50",
        // Sizes
        size === "sm" && "px-4 py-2",
        size === "md" && "px-6 py-3",
        size === "lg" && "px-8 py-4",
        // States
        (disabled || loading) && "opacity-50",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#62D9C7"}
        />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={cn(
              "font-semibold",
              // Text color per variant
              variant === "primary" && "text-white",
              (isOutlineOrGhost || variant === "secondary") && "text-primary",
              variant === "danger" && "text-error",
              // Text size per size
              size === "sm" && "text-sm",
              size === "md" && "text-base",
              size === "lg" && "text-lg",
            )}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
