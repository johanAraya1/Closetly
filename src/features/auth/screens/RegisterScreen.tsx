import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/utils/errors";

import { signUp } from "../services/auth.service";
import { registerSchema, type RegisterInput } from "../validations/auth.validation";

export const RegisterScreen = () => {
  const { t } = useTranslation();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", username: "" }
  });

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => router.replace("/closet")
  });

  return (
    <ScreenShell title={t("register")} subtitle="Empieza con un perfil publico o privado cuando quieras.">
      <View className="gap-4">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <TextField label={t("username")} value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField label={t("email")} value={field.value} onChangeText={field.onChange} keyboardType="email-address" error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField label={t("password")} value={field.value} onChangeText={field.onChange} secureTextEntry error={fieldState.error?.message} />
          )}
        />
        <Button title={t("register")} loading={mutation.isPending} onPress={form.handleSubmit((data) => mutation.mutate(data))} />
        {mutation.error ? <Text className="text-sm text-red-600">{getErrorMessage(mutation.error)}</Text> : null}
      </View>
    </ScreenShell>
  );
};
