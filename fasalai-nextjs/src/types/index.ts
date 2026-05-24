// src/types/index.ts
// Shared TypeScript types for FasalAI

export type Language = "ENGLISH" | "HINDI";
export type CropCategory = "GRAIN" | "OILSEED" | "VEGETABLE" | "FRUIT" | "FIBER" | "SPICE" | "PULSE" | "OTHER";
export type Season = "KHARIF" | "RABI" | "ZAID";
export type Trend = "RISING" | "FALLING" | "STABLE";
export type AlertCondition = "ABOVE" | "BELOW";
export type AlertChannel = "SMS" | "WHATSAPP" | "EMAIL";

export interface Crop {
  id: string;
  name: string;
  nameHindi: string;
  category: CropCategory;
  season: Season[];
  unit: string;
  imageUrl?: string;
}

export interface Mandi {
  id: string;
  name: string;
  nameHindi: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  timings?: string;
  facilities: string[];
  rating?: number;
  distance?: number; // km, added when searched by location
}

export interface PriceRecord {
  id: string;
  cropId: string;
  mandiId: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  arrivalQty?: number;
  date: string;
  crop?: Pick<Crop, "name" | "nameHindi" | "unit">;
  mandi?: Pick<Mandi, "name" | "nameHindi" | "district" | "state">;
}

export interface PricePrediction {
  id?: string;
  cropId: string;
  mandiId?: string;
  predictedPrice: number;
  minPrice?: number;
  maxPrice?: number;
  confidence: number;
  trend: Trend;
  horizon: number;
  targetDate: string;
  crop?: Pick<Crop, "name" | "nameHindi">;
  mandi?: Pick<Mandi, "name" | "nameHindi">;
}

export interface Alert {
  id: string;
  userId: string;
  cropId: string;
  mandiId?: string;
  targetPrice: number;
  condition: AlertCondition;
  channels: AlertChannel[];
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  createdAt: string;
  crop?: Pick<Crop, "name" | "nameHindi" | "category">;
}

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  district?: string;
  language: Language;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  total?: number;
}

export interface PricesApiResponse {
  prices: PriceRecord[];
  source: string;
  total: number;
  latestPrice: number;
  priceChange: number;
  trend: Trend;
}

export interface DashboardStats {
  totalCrops: number;
  activeAlerts: number;
  pricesTracked: number;
  lastUpdated: string;
}
