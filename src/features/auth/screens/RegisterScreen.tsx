import { useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { getErrorMessage } from "@/utils/errors";

import { signUp } from "../services/auth.service";
import { registerSchema, type RegisterInput } from "../validations/auth.validation";

type FormErrors = {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
};

export const RegisterScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", username: "" }
  });

  const watchedPassword = form.watch("password");

  const passwordCriteria = useMemo(() => {
    const pwd = watchedPassword || "";
    return {
      length: pwd.length >= 8 && pwd.length <= 16,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pwd),
      all: pwd.length >= 8 && pwd.length <= 16 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(pwd)
    };
  }, [watchedPassword]);

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      setShowSuccessModal(true);
      setTimeout(() => {
        router.replace("/closet");
      }, 2000);
    },
    onError: (error) => {
      const msg = getErrorMessage(error);
      let friendlyMessage = "Error al crear la cuenta";
      if (msg.includes("already exists") || msg.includes("duplicate") || msg.includes("already registered")) {
        friendlyMessage = "Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.";
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout") || msg.includes("Network")) {
        friendlyMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
      }
      setErrorMessage(friendlyMessage);
      setShowErrorModal(true);
    }
  });

  const validateClient = (data: RegisterInput) => {
    const errors: FormErrors = {};

    if (!data.email) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email inválido";
    }

    if (!data.username) {
      errors.username = "El usuario es requerido";
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = "Solo letras, números y guión bajo";
    }

    if (!data.password) {
      errors.password = "La contraseña es requerida";
    } else if (!passwordCriteria.all) {
      errors.password = "La contraseña no cumple con los requisitos";
    }

    if (passwordCriteria.all && !confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (passwordCriteria.all && confirmPassword !== data.password) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = form.handleSubmit((data) => {
    if (!validateClient(data)) {
      setErrorMessage("Por favor, completa todos los campos correctamente");
      setShowErrorModal(true);
      return;
    }
    mutation.mutate(data);
  });

  const rules = [
    { key: "length", label: "8 a 16 caracteres", met: passwordCriteria.length },
    { key: "uppercase", label: "Una letra mayúscula", met: passwordCriteria.uppercase },
    { key: "lowercase", label: "Una letra minúscula", met: passwordCriteria.lowercase },
    { key: "number", label: "Un número", met: passwordCriteria.number },
    { key: "special", label: "Un caracter especial", met: passwordCriteria.special }
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-canvas items-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 w-full"
        style={{ maxWidth: 440 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
            Create Account
          </Text>

          {/* Subtitle */}
          <Text style={{ fontSize: 16, color: "#6B7280", marginBottom: 32 }}>
            Join Closetly and organize your wardrobe
          </Text>

          {/* Email */}
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                label="Email"
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setClientErrors((prev) => ({ ...prev, email: undefined }));
                }}
                onBlur={field.onBlur}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={clientErrors.email || fieldState.error?.message}
                icon={<Ionicons name="mail-outline" size={20} color="#9CA3AF" />}
              />
            )}
          />

          {/* Username */}
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <TextField
                label="Username"
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setClientErrors((prev) => ({ ...prev, username: undefined }));
                }}
                onBlur={field.onBlur}
                placeholder="username"
                autoCapitalize="none"
                error={clientErrors.username || fieldState.error?.message}
                icon={<Ionicons name="at-outline" size={20} color="#9CA3AF" />}
              />
            )}
          />

          {/* Full Name (Optional) */}
          <TextField
            label="Full Name (Optional)"
            placeholder="John Doe"
            icon={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
          />

          {/* Password */}
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                label="Password"
                value={field.value}
                onChangeText={(text) => {
                  field.onChange(text);
                  setClientErrors((prev) => ({ ...prev, password: undefined }));
                }}
                onBlur={field.onBlur}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                maxLength={16}
                error={clientErrors.password || fieldState.error?.message}
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

          {/* Password Rules */}
          <View
            className="bg-white rounded-card border border-gray-200 p-3 mb-4"
          >
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              La contraseña debe tener:
            </Text>
            {rules.map((rule) => (
              <View key={rule.key} className="flex-row items-center mb-1.5" style={{ gap: 8 }}>
                <Ionicons
                  name={rule.met ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={rule.met ? "#10B981" : "#EF4444"}
                />
                <Text className="text-[13px] text-gray-700">{rule.label}</Text>
              </View>
            ))}
          </View>

          {/* Confirm Password (only when all criteria met) */}
          {passwordCriteria.all && (
            <TextField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setClientErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="••••••••"
              secureTextEntry={!showConfirmPassword}
              maxLength={16}
              error={clientErrors.confirmPassword}
              icon={<Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              }
            />
          )}

          {/* Register Button */}
          <View className="mt-4">
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={mutation.isPending}
              fullWidth
            />
          </View>

          {/* Footer */}
          <View className="flex-row items-center justify-center mt-6">
            <Text style={{ color: "#6B7280", fontSize: 15 }}>
              Already have an account?{" "}
            </Text>
            <Button
              title="Sign In"
              onPress={() => router.push("/auth/login")}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        type="error"
        title="Error en el Registro"
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        type="success"
        title="¡Cuenta Creada!"
        message="Tu cuenta se ha creado exitosamente. Redirigiendo..."
        actions={[
          {
            text: "Continuar",
            onPress: () => {
              setShowSuccessModal(false);
              router.replace("/closet");
            },
            variant: "primary"
          }
        ]}
      />
    </SafeAreaView>
  );
};
