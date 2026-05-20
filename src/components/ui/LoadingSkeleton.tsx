import { View } from "react-native";

type LoadingSkeletonProps = {
  width?: string | number;
  height?: string | number;
};

export function LoadingSkeleton({ width = "100%", height = 16 }: LoadingSkeletonProps) {
  return <View className="rounded-full bg-secondary opacity-50" style={{ width, height }} />;
}
