import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { trackCriticalEvent } from "@/services/analytics";
import { supabase } from "@/services/supabase";
import { prepareGarmentImage } from "@/utils/image";

import {
  analyzeGarment,
  createGarment,
  findDuplicateGarment,
  uploadGarmentAssets
} from "../services/closet.service";

export const useUploadGarment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error("Photo permission denied");

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false
      });

      if (picked.canceled) return null;

      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User session required");

      const asset = await prepareGarmentImage(picked.assets[0].uri);
      const duplicate = await findDuplicateGarment(asset.fileHash, user.id);
      if (duplicate) return duplicate;

      const uploaded = await uploadGarmentAssets(
        user.id,
        asset.fileHash,
        asset.originalUri,
        asset.thumbnailUri
      );

      const garment = await createGarment({
        image_url: uploaded.originalPath,
        thumbnail_url: uploaded.thumbnailPublicUrl,
        storage_path: uploaded.originalPath,
        thumbnail_path: uploaded.thumbnailPath,
        file_hash: asset.fileHash,
        file_size: asset.fileSize,
        aspect_ratio: asset.aspectRatio
      });

      void analyzeGarment(garment.id).catch((error) =>
        trackCriticalEvent("ai_failure", { garmentId: garment.id, reason: String(error) })
      );

      await trackCriticalEvent("garment_uploaded", {
        garmentId: garment.id,
        bytes: asset.fileSize
      });

      return garment;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.garments });
    },
    onError: (error) => {
      void trackCriticalEvent("upload_failure", { reason: String(error) });
    }
  });
};
