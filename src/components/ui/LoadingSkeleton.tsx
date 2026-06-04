import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface SkeletonCardProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

const SkeletonCard = ({
  width = "100%",
  height = 120,
  borderRadius = 12,
  className,
}: SkeletonCardProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      className={className}
      style={{
        width: width as any,
        height,
        borderRadius,
        opacity,
        backgroundColor: "#E5E7EB",
      }}
    />
  );
};

export const SkeletonGarmentCard = () => (
  <View className="mb-4">
    <SkeletonCard height={160} borderRadius={12} />
    <View className="mt-2 gap-2">
      <SkeletonCard width="70%" height={16} />
      <SkeletonCard width="50%" height={12} />
    </View>
  </View>
);

export const SkeletonOutfitCard = () => (
  <View className="mb-4">
    <SkeletonCard height={200} borderRadius={12} />
    <View className="mt-3 gap-2">
      <SkeletonCard width="60%" height={18} />
      <SkeletonCard width="80%" height={14} />
    </View>
  </View>
);

export const SkeletonList = ({
  count = 3,
  type = "garment",
}: {
  count?: number;
  type?: "garment" | "outfit";
}) => {
  const Component = type === "garment" ? SkeletonGarmentCard : SkeletonOutfitCard;

  return (
    <View className="p-4">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </View>
  );
};

// Alias para compatibilidad — 4 screens importan { LoadingSkeleton }
/** @deprecated Usá SkeletonList o SkeletonGarmentCard */
export const LoadingSkeleton = SkeletonList;

export default SkeletonCard;
