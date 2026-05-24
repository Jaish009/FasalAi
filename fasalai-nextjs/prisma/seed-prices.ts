// prisma/seed-prices.ts
// Seeds ~1 year of realistic Indian mandi price data for AI model training
// Run: npx tsx prisma/seed-prices.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Realistic base prices (₹ per quintal) with seasonal multipliers ──
const CROP_PRICE_PROFILES: Record<string, {
  base: number;       // average modal price
  volatility: number; // 0-1, how much the price swings day-to-day
  seasonal: number[]; // 12 monthly multipliers (Jan=0 ... Dec=11)
  arrivalBase: number; // average daily arrival in tonnes
}> = {
  "crop-wheat": {
    base: 2200,
    volatility: 0.03,
    seasonal: [1.05, 1.08, 1.10, 0.90, 0.85, 0.88, 0.92, 0.95, 0.98, 1.00, 1.02, 1.04],
    arrivalBase: 450,
  },
  "crop-soybean": {
    base: 4800,
    volatility: 0.04,
    seasonal: [0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.00, 1.05, 1.08, 1.12, 1.10, 1.00],
    arrivalBase: 320,
  },
  "crop-onion": {
    base: 1800,
    volatility: 0.08,
    seasonal: [0.70, 0.65, 0.60, 0.75, 0.90, 1.10, 1.30, 1.50, 1.40, 1.20, 0.90, 0.80],
    arrivalBase: 600,
  },
  "crop-cotton": {
    base: 6200,
    volatility: 0.03,
    seasonal: [1.02, 1.00, 0.98, 0.95, 0.93, 0.95, 0.97, 1.00, 1.02, 1.05, 1.08, 1.05],
    arrivalBase: 280,
  },
  "crop-maize": {
    base: 1900,
    volatility: 0.04,
    seasonal: [1.00, 0.98, 0.95, 0.93, 0.95, 1.00, 1.05, 1.08, 1.10, 1.05, 1.02, 1.00],
    arrivalBase: 380,
  },
  "crop-paddy": {
    base: 2100,
    volatility: 0.03,
    seasonal: [1.05, 1.08, 1.10, 1.05, 1.00, 0.95, 0.92, 0.90, 0.88, 0.90, 0.95, 1.00],
    arrivalBase: 520,
  },
  "crop-tomato": {
    base: 1500,
    volatility: 0.12,
    seasonal: [0.60, 0.55, 0.50, 0.70, 0.90, 1.20, 1.60, 1.80, 1.50, 1.10, 0.80, 0.65],
    arrivalBase: 400,
  },
  "crop-garlic": {
    base: 5500,
    volatility: 0.05,
    seasonal: [0.85, 0.80, 0.78, 0.82, 0.90, 1.00, 1.10, 1.15, 1.20, 1.15, 1.05, 0.95],
    arrivalBase: 150,
  },
  "crop-chana": {
    base: 4800,
    volatility: 0.03,
    seasonal: [1.02, 1.05, 1.08, 0.95, 0.90, 0.88, 0.92, 0.95, 0.98, 1.00, 1.02, 1.03],
    arrivalBase: 350,
  },
  "crop-mustard": {
    base: 5200,
    volatility: 0.04,
    seasonal: [1.00, 1.02, 1.05, 0.92, 0.88, 0.90, 0.95, 0.98, 1.00, 1.02, 1.05, 1.03],
    arrivalBase: 200,
  },
  "crop-potato": {
    base: 1000,
    volatility: 0.07,
    seasonal: [0.70, 0.65, 0.60, 0.75, 0.85, 1.00, 1.20, 1.40, 1.50, 1.30, 1.00, 0.80],
    arrivalBase: 500,
  },
  "crop-sugarcane": {
    base: 3000,
    volatility: 0.02,
    seasonal: [1.00, 1.00, 1.02, 1.02, 1.01, 1.00, 0.98, 0.98, 0.99, 1.00, 1.00, 1.00],
    arrivalBase: 800,
  },
  "crop-cabbage": {
    base: 800,
    volatility: 0.09,
    seasonal: [0.75, 0.70, 0.65, 0.80, 0.95, 1.10, 1.30, 1.40, 1.35, 1.15, 0.90, 0.80],
    arrivalBase: 300,
  },
  "crop-cauliflower": {
    base: 1100,
    volatility: 0.08,
    seasonal: [0.80, 0.75, 0.70, 0.85, 0.95, 1.05, 1.20, 1.35, 1.30, 1.15, 0.95, 0.85],
    arrivalBase: 280,
  },
  "crop-brinjal": {
    base: 1200,
    volatility: 0.07,
    seasonal: [0.85, 0.80, 0.78, 0.85, 0.95, 1.05, 1.15, 1.25, 1.20, 1.10, 0.95, 0.88],
    arrivalBase: 250,
  },
  "crop-chilli": {
    base: 8000,
    volatility: 0.05,
    seasonal: [0.90, 0.88, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10, 1.15, 1.10, 1.02, 0.95],
    arrivalBase: 120,
  },
};

const MANDI_IDS = [
  "mandi-indore",
  "mandi-ujjain",
  "mandi-dewas",
  "mandi-khargone",
  "mandi-bhopal",
];

// Mandi-level price offsets (some mandis are slightly cheaper/pricier)
const MANDI_MULTIPLIER: Record<string, number> = {
  "mandi-indore": 1.00,
  "mandi-ujjain": 0.97,
  "mandi-dewas": 0.95,
  "mandi-khargone": 0.93,
  "mandi-bhopal": 1.03,
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function gaussianRandom(rand: () => number): number {
  // Box-Muller transform for more realistic price movements
  const u1 = rand();
  const u2 = rand();
  return Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
}

async function main() {
  console.log("📊 Seeding realistic price history data...\n");

  const now = new Date();
  const startDate = new Date(now);
  startDate.setFullYear(startDate.getFullYear() - 1); // 1 year back
  startDate.setDate(startDate.getDate() - 90); // plus 90 extra days = ~15 months

  const cropIds = Object.keys(CROP_PRICE_PROFILES);
  let totalRecords = 0;
  let totalPairs = 0;

  for (const cropId of cropIds) {
    const profile = CROP_PRICE_PROFILES[cropId];

    for (const mandiId of MANDI_IDS) {
      totalPairs++;
      const mandiMult = MANDI_MULTIPLIER[mandiId] || 1.0;
      const rand = seededRandom(cropId.length * 1000 + mandiId.length * 7 + totalPairs * 31);

      // Generate daily price data with realistic random walk
      let currentPrice = profile.base * mandiMult;
      const records: any[] = [];
      const date = new Date(startDate);

      while (date <= now) {
        const month = date.getMonth();
        const seasonalFactor = profile.seasonal[month];
        const targetPrice = profile.base * mandiMult * seasonalFactor;

        // Price follows a mean-reverting random walk around the seasonal target
        const noise = gaussianRandom(rand) * profile.volatility * currentPrice;
        const meanReversion = (targetPrice - currentPrice) * 0.05; // 5% pull toward target
        currentPrice = Math.max(currentPrice + noise + meanReversion, profile.base * 0.3);

        const modalPrice = Math.round(currentPrice);
        const spread = modalPrice * (0.05 + rand() * 0.08); // 5-13% spread
        const minPrice = Math.round(modalPrice - spread);
        const maxPrice = Math.round(modalPrice + spread);
        const arrivalQty = Math.round(
          profile.arrivalBase * seasonalFactor * (0.6 + rand() * 0.8)
        );

        // Skip some random days (mandis don't operate every day)
        if (rand() > 0.15) { // ~85% of days have data
          records.push({
            cropId,
            mandiId,
            price: modalPrice,
            minPrice,
            maxPrice,
            modalPrice,
            arrivalQty,
            date: new Date(date),
            source: "agmarknet-seed",
          });
        }

        date.setDate(date.getDate() + 1);
      }

      // Batch upsert in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((r) =>
            prisma.priceRecord.upsert({
              where: {
                cropId_mandiId_date: {
                  cropId: r.cropId,
                  mandiId: r.mandiId,
                  date: r.date,
                },
              },
              update: {
                price: r.price,
                minPrice: r.minPrice,
                maxPrice: r.maxPrice,
                modalPrice: r.modalPrice,
                arrivalQty: r.arrivalQty,
              },
              create: r,
            })
          )
        );
      }

      totalRecords += records.length;
      const cropName = cropId.replace("crop-", "");
      const mandiName = mandiId.replace("mandi-", "");
      console.log(`  ✅ ${cropName} @ ${mandiName}: ${records.length} days of prices`);
    }
  }

  console.log(`\n📊 Total: ${totalRecords} price records across ${totalPairs} crop-mandi pairs`);
  console.log("🌾 Price data seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Price seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
