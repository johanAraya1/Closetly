export const FREE_LIMITS = {
  maxGarments: 120,
  maxManualOutfits: 40,
  aiGarmentAnalysesPerDay: 12,
  aiGeneratedOutfitsPerWeek: 0,
  uploadMaxEdgePx: 1080,
  thumbnailPx: 480,
  imageQuality: 0.78
} as const;

export const PREMIUM_LIMITS = {
  maxGarments: 1000,
  maxManualOutfits: 300,
  aiGarmentAnalysesPerDay: 60,
  aiGeneratedOutfitsPerWeek: 12
} as const;
