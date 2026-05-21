import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TextField } from "@/components/ui/TextField";
import { trackCriticalEvent } from "@/services/analytics";
import { getErrorMessage } from "@/utils/errors";

import { signIn } from "../services/auth.service";
import { loginSchema, type LoginInput } from "../validations/auth.validation";

export const LoginScreen = () => {
  const { t } = useTranslation();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => router.replace("/closet"),
    onError: (error) => trackCriticalEvent("auth_failure", { reason: getErrorMessage(error) })
  });

  return (
    <ScreenShell title="Closetly" subtitle="Tu closet inteligente, social y ligero.">
      <View className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label={t("email")}
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label={t("password")}
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={fieldState.error?.message}
            />
          )}
        />
        <Button title={t("login")} loading={mutation.isPending} onPress={form.handleSubmit((data) => mutation.mutate(data))} />
        {mutation.error ? <Text className="text-sm text-red-600">{getErrorMessage(mutation.error)}</Text> : null}
        <Link href="/auth/register" className="text-center text-base font-semibold text-violet">
          {t("register")}
        </Link>
      </View>
    </ScreenShell>
  );
};
