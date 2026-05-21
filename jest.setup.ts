import "@testing-library/jest-native/extend-expect";

jest.mock("expo-crypto", () => ({
  randomUUID: () => "test-request-id",
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digestStringAsync: jest.fn(async () => "test-digest")
}));
