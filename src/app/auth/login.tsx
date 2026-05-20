import { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { ScreenShell } from "@components/ui/ScreenShell";
import { useAuthStore } from "@store/useAuthStore";
import { loginSchema } from "@utils/validation";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      loginSchema.parse({ email, password });
      await login({ email, password });
      router.replace("/");
    } catch (err) {
      setError(t("authError"));
    }
  }

  return (
    <ScreenShell title={t("loginTitle")}>
      <View className="space-y-3 px-4">
        <Input label={t("emailLabel")} placeholder="hello@closetly.app" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={t("passwordLabel")} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text className="text-red-500">{error}</Text> : null}
        <Button title={t("loginButton")} onPress={handleSubmit} />
        <Button title={t("goRegister")} variant="ghost" onPress={() => router.push("/auth/register")} />
      </View>
    </ScreenShell>
  );
}
