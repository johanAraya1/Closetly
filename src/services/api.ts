import axios from "axios";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const api = axios.create({
  baseURL: String(extra.edgeBaseUrl ?? "https://api.closetly.dev"),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});
