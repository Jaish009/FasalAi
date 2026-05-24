// src/lib/agmarknet.ts
// Agmarknet Government API Integration
// Official API: https://agmarknet.gov.in

import axios from "axios";
import { prisma } from "./prisma";

const AGMARKNET_BASE = process.env.AGMARKNET_BASE_URL || "https://agmarknet.gov.in";
const API_KEY = process.env.AGMARKNET_API_KEY;

export interface AgmarknetPrice {
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  reportedDate: string;
  arrivalQty?: number;
}

// ── Fetch prices from Agmarknet API ──
export async function fetchAgmarknetPrices(params: {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AgmarknetPrice[]> {
  try {
    // Agmarknet uses a specific API format
    const response = await axios.get(`${AGMARKNET_BASE}/api/prices`, {
      params: {
        api_key: API_KEY,
        format: "json",
        commodity: params.commodity,
        state: params.state,
        district: params.district,
        market: params.market,
        date_from: params.dateFrom || new Date().toISOString().split("T")[0],
        date_to: params.dateTo || new Date().toISOString().split("T")[0],
      },
      timeout: 10000,
    });

    return response.data?.records || [];
  } catch (error) {
    console.error("Agmarknet API error:", error);
    // Return mock data in development if API is unavailable
    if (process.env.NODE_ENV === "development") {
      return getMockPrices(params.commodity);
    }
    throw new Error("Failed to fetch prices from Agmarknet");
  }
}

// ── Sync latest prices to database ──
export async function syncPricesToDB(): Promise<number> {
  const crops = await prisma.crop.findMany();
  const mandis = await prisma.mandi.findMany();
  let synced = 0;

  for (const crop of crops) {
    for (const mandi of mandis) {
      try {
        const prices = await fetchAgmarknetPrices({
          commodity: crop.name,
          state: mandi.state,
          district: mandi.district,
          market: mandi.name,
        });

        if (prices.length > 0) {
          const latest = prices[0];
          await prisma.priceRecord.upsert({
            where: {
              cropId_mandiId_date: {
                cropId: crop.id,
                mandiId: mandi.id,
                date: new Date(latest.reportedDate),
              },
            },
            update: {
              price: latest.modalPrice,
              minPrice: latest.minPrice,
              maxPrice: latest.maxPrice,
              modalPrice: latest.modalPrice,
              arrivalQty: latest.arrivalQty,
            },
            create: {
              cropId: crop.id,
              mandiId: mandi.id,
              price: latest.modalPrice,
              minPrice: latest.minPrice,
              maxPrice: latest.maxPrice,
              modalPrice: latest.modalPrice,
              arrivalQty: latest.arrivalQty,
              date: new Date(latest.reportedDate),
            },
          });
          synced++;
        }
      } catch {
        // Skip failed combinations, continue with rest
        continue;
      }
    }
  }

  return synced;
}

// ── Check alerts after price sync ──
export async function checkAndFireAlerts(cropId: string, mandiId: string, currentPrice: number) {
  const alerts = await prisma.alert.findMany({
    where: {
      cropId,
      isActive: true,
      triggered: false,
      OR: [{ mandiId }, { mandiId: null }],
    },
    include: { user: true, crop: true },
  });

  for (const alert of alerts) {
    const shouldTrigger =
      (alert.condition === "ABOVE" && currentPrice >= alert.targetPrice) ||
      (alert.condition === "BELOW" && currentPrice <= alert.targetPrice);

    if (shouldTrigger) {
      // Mark alert as triggered
      await prisma.alert.update({
        where: { id: alert.id },
        data: {
          triggered: true,
          triggeredAt: new Date(),
          triggeredPrice: currentPrice,
        },
      });

      // Fire notifications (handled by notification service)
      await fireAlertNotifications(alert, currentPrice);
    }
  }
}

async function fireAlertNotifications(alert: any, currentPrice: number) {
  // Dynamically import to avoid circular deps
  const { sendAlertSMS } = await import("./twilio");
  const { sendAlertEmail } = await import("./resend");

  const message = `FasalAI Alert: ${alert.crop.name} (${alert.crop.nameHindi}) price is ₹${currentPrice}/quintal at your tracked mandi. Your target was ₹${alert.targetPrice}.`;

  if (alert.channels.includes("SMS") && alert.user.phone) {
    await sendAlertSMS(alert.user.phone, message);
  }

  if (alert.channels.includes("WHATSAPP") && alert.user.phone) {
    await sendAlertSMS(`whatsapp:${alert.user.phone}`, message);
  }

  if (alert.channels.includes("EMAIL")) {
    await sendAlertEmail({
      to: alert.user.email,
      userName: alert.user.name,
      cropName: alert.crop.name,
      cropNameHindi: alert.crop.nameHindi,
      currentPrice,
      targetPrice: alert.targetPrice,
      condition: alert.condition,
    });
  }
}

// ── Mock data for development ──
function getMockPrices(commodity?: string): AgmarknetPrice[] {
  const mockData: Record<string, number> = {
    Wheat: 2185,
    Soybean: 4320,
    Onion: 1240,
    Cotton: 6800,
    Maize: 1890,
    Paddy: 2040,
    Tomato: 850,
    Garlic: 3100,
  };

  const crop = commodity || "Wheat";
  const basePrice = mockData[crop] || 2000;
  const variation = (Math.random() - 0.5) * 100;

  return [
    {
      commodity: crop,
      variety: "Common",
      state: "Madhya Pradesh",
      district: "Indore",
      market: "Indore",
      minPrice: basePrice - 100,
      maxPrice: basePrice + 100,
      modalPrice: basePrice + variation,
      reportedDate: new Date().toISOString().split("T")[0],
      arrivalQty: Math.floor(Math.random() * 500) + 100,
    },
  ];
}
