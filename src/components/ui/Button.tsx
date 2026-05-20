import { Pressable, Text, PressableProps } from "react-native";
import clsx from "clsx";

type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ title, variant = "primary", className, ...props }: ButtonProps) {
  const baseStyles = "rounded-3xl px-4 py-3 items-center justify-center";
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-text",
    ghost: "bg-transparent border border-secondary text-text"
  };

  return (
    <Pressable className={`${baseStyles} ${variants[variant]} ${className ?? ""}`} {...props}>
      <Text className="text-base font-semibold text-center text-white">{title}</Text>
    </Pressable>
  );
}
