import { useState } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { ScreenShell } from "@components/ui/ScreenShell";
import { useAuthStore } from "@store/useAuthStore";
import { registerSchema } from "@utils/validation";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      registerSchema.parse({ email, username, password });
      await register({ email, password, username });
      router.replace("/");
    } catch (err) {
      setError(t("authError"));
    }
  }

  return (
    <ScreenShell title={t("registerTitle")}>
      <View className="space-y-3 px-4">
        <Input label={t("emailLabel")} placeholder="hello@closetly.app" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={t("usernameLabel")} placeholder="closetlover" value={username} onChangeText={setUsername} />
        <Input label={t("passwordLabel")} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text className="text-red-500">{error}</Text> : null}
        <Button title={t("registerButton")} onPress={handleSubmit} />
      </View>
    </ScreenShell>
  );
}
