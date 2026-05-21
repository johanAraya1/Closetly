import { Link, usePathname } from "expo-router";
import { MessageCircle, Search, Settings, Shirt, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

const tabs = [
  { href: "/closet", labelKey: "closet", icon: Shirt },
  { href: "/outfits", labelKey: "outfits", icon: Sparkles },
  { href: "/explore", labelKey: "explore", icon: Search },
  { href: "/chat", labelKey: "chat", icon: MessageCircle },
  { href: "/settings", labelKey: "settings", icon: Settings }
] as const;

export const AppTabBar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <View className="border-t border-muted bg-surface px-2 pb-3 pt-2">
      <View className="flex-row justify-between">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link key={tab.href} href={tab.href} className="flex-1">
              <View className="items-center gap-1">
                <Icon size={20} color={active ? "#8B5CF6" : "#8A817C"} strokeWidth={2.2} />
                <Text className={active ? "text-xs font-semibold text-violet" : "text-xs text-stone-500"}>
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
