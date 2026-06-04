import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { trackCriticalEvent } from "@/services/analytics";
import { getErrorMessage } from "@/utils/errors";

import { signIn } from "../services/auth.service";
import { loginSchema, type LoginInput } from "../validations/auth.validation";

export const LoginScreen = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => router.replace("/closet"),
    onError: (error) => {
      const msg = getErrorMessage(error);
      trackCriticalEvent("auth_failure", { reason: msg });

      let friendlyMessage = "Error al iniciar sesión";
      if (msg.includes("Invalid login credentials")) {
        friendlyMessage = "Correo o contraseña incorrectos. Por favor, verifica tus credenciales.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout") || msg.includes("Network")) {
        friendlyMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
      }
      setErrorMessage(friendlyMessage);
      setShowErrorModal(true);
    }
  });

  const handleLogin = form.handleSubmit((data) => mutation.mutate(data));

  return (
    <SafeAreaView className="flex-1 bg-canvas items-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 w-full"
        style={{ maxWidth: 440 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
            Bienvenido de nuevo
          </Text>

          {/* Subtitle */}
          <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 32 }}>
            Inicia sesión para continuar
          </Text>

          {/* Email */}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldState.error?.message}
                icon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
              />
            )}
          />

          {/* Password */}
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                label="Password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                error={fieldState.error?.message}
                icon={<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                }
              />
            )}
          />

          {/* Login Button */}
          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={mutation.isPending}
            fullWidth
          />

          {/* Footer */}
          <View className="flex-row items-center justify-center mt-6">
            <Text style={{ color: "#6B7280", fontSize: 15 }}>
              ¿No tienes cuenta?{" "}
            </Text>
            <Button
              title="Registrarse"
              onPress={() => router.push("/auth/register")}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        type="error"
        title="Error al Iniciar Sesión"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
        actions={[
          {
            text: "Entendido",
            onPress: () => setShowErrorModal(false),
            variant: "primary"
          }
        ]}
      />
    </SafeAreaView>
  );
};
