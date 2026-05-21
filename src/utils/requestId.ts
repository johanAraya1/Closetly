import * as Crypto from "expo-crypto";

export const createRequestId = () => {
  try {
    return Crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};
