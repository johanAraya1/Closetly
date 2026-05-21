import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

import { FREE_LIMITS } from "@/constants/limits";

export type PreparedImageAsset = {
  originalUri: string;
  thumbnailUri: string;
  fileHash: string;
  fileSize?: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

export const prepareGarmentImage = async (uri: string): Promise<PreparedImageAsset> => {
  const original = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: FREE_LIMITS.uploadMaxEdgePx } }],
    {
      compress: FREE_LIMITS.imageQuality,
      format: ImageManipulator.SaveFormat.WEBP
    }
  );

  const thumbnail = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: FREE_LIMITS.thumbnailPx } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.WEBP
    }
  );

  const base64 = await FileSystem.readAsStringAsync(original.uri, {
    encoding: FileSystem.EncodingType.Base64
  });
  const fileHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);
  const info = await FileSystem.getInfoAsync(original.uri, { size: true });

  return {
    originalUri: original.uri,
    thumbnailUri: thumbnail.uri,
    fileHash,
    fileSize: info.exists ? info.size : undefined,
    width: original.width,
    height: original.height,
    aspectRatio: original.width && original.height ? original.width / original.height : undefined
  };
};
