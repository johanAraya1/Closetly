/**
 * Modal Component
 * Modal reutilizable para éxito, error e información
 * Copia visual exacta de Closetly_FE
 */

import { View, Text, Modal as RNModal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "./Button";

export type ModalType = "success" | "error" | "info";

interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

interface ModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  actions?: ModalAction[];
  onClose?: () => void;
  closeOnBackdrop?: boolean;
}

const getIconName = (type: ModalType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case "success":
      return "checkmark-circle";
    case "error":
      return "close-circle";
    case "info":
      return "information-circle";
  }
};

const getIconColor = (type: ModalType): string => {
  switch (type) {
    case "success":
      return "#10B981";
    case "error":
      return "#EF4444";
    case "info":
      return "#6A4BFF";
  }
};

export const Modal = ({
  visible,
  type,
  title,
  message,
  actions = [],
  onClose,
  closeOnBackdrop = true,
}: ModalProps) => {
  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center p-5"
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity
          className="bg-white rounded-modal p-6 w-full relative"
          style={{ maxWidth: 400, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {onClose && (
            <TouchableOpacity
              className="absolute top-4 right-4 z-10 p-1"
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}

          {/* Icon */}
          <View className="items-center mb-4">
            <Ionicons name={getIconName(type)} size={64} color={getIconColor(type)} />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-3">{title}</Text>

          {/* Message */}
          <Text
            className="text-[15px] text-gray-500 text-center mb-6"
            style={{ lineHeight: 22 }}
          >
            {message}
          </Text>

          {/* Actions */}
          {actions.length > 0 && (
            <View className="gap-3">
              {actions.map((action, index) => (
                <View key={index} className="w-full">
                  <Button
                    title={action.text}
                    onPress={action.onPress}
                    variant={action.variant || "primary"}
                    fullWidth
                  />
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};
