import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const tabs = [
  { href: "/closet", labelKey: "closet", icon: "shirt-outline" as const },
  { href: "/outfits", labelKey: "outfits", icon: "toggle-outline" as const },
  { href: "/explore", labelKey: "explore", icon: "search-outline" as const },
  { href: "/chat", labelKey: "chat", icon: "chatbubble-outline" as const },
  { href: "/settings", labelKey: "settings", icon: "settings-outline" as const },
] as const;

export const AppTabBar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <View className="border-t border-gray-200 bg-white px-2 pb-3 pt-2">
      <View className="flex-row justify-between">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const IconComponent = Ionicons;

          return (
            <Link key={tab.href} href={tab.href} className="flex-1">
              <View className="items-center gap-1">
                <IconComponent
                  name={tab.icon}
                  size={22}
                  color={active ? "#62D9C7" : "#9CA3AF"}
                />
                <Text
                  className={
                    active
                      ? "text-xs font-semibold text-primary"
                      : "text-xs text-gray-400"
                  }
                >
                  {t(tab.labelKey)}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
};
