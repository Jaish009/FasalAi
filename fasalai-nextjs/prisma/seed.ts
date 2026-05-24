// prisma/seed.ts
// Run: npm run db:seed

import { PrismaClient, CropCategory, Season } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FasalAI database...");

  // ── CROPS ──
  const crops = await Promise.all([
    prisma.crop.upsert({
      where: { id: "crop-wheat" },
      update: {},
      create: {
        id: "crop-wheat",
        name: "Wheat",
        nameHindi: "गेहूं",
        category: CropCategory.GRAIN,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-soybean" },
      update: {},
      create: {
        id: "crop-soybean",
        name: "Soybean",
        nameHindi: "सोयाबीन",
        category: CropCategory.OILSEED,
        season: [Season.KHARIF],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-onion" },
      update: {},
      create: {
        id: "crop-onion",
        name: "Onion",
        nameHindi: "प्याज",
        category: CropCategory.VEGETABLE,
        season: [Season.RABI, Season.KHARIF],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-cotton" },
      update: {},
      create: {
        id: "crop-cotton",
        name: "Cotton",
        nameHindi: "कपास",
        category: CropCategory.FIBER,
        season: [Season.KHARIF],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-maize" },
      update: {},
      create: {
        id: "crop-maize",
        name: "Maize",
        nameHindi: "मक्का",
        category: CropCategory.GRAIN,
        season: [Season.KHARIF, Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-paddy" },
      update: {},
      create: {
        id: "crop-paddy",
        name: "Paddy",
        nameHindi: "धान",
        category: CropCategory.GRAIN,
        season: [Season.KHARIF],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-tomato" },
      update: {},
      create: {
        id: "crop-tomato",
        name: "Tomato",
        nameHindi: "टमाटर",
        category: CropCategory.VEGETABLE,
        season: [Season.RABI, Season.ZAID],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-garlic" },
      update: {},
      create: {
        id: "crop-garlic",
        name: "Garlic",
        nameHindi: "लहसुन",
        category: CropCategory.SPICE,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-chana" },
      update: {},
      create: {
        id: "crop-chana",
        name: "Chana (Chickpea)",
        nameHindi: "चना",
        category: CropCategory.PULSE,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-mustard" },
      update: {},
      create: {
        id: "crop-mustard",
        name: "Mustard",
        nameHindi: "सरसों",
        category: CropCategory.OILSEED,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-potato" },
      update: {},
      create: {
        id: "crop-potato",
        name: "Potato",
        nameHindi: "आलू",
        category: CropCategory.VEGETABLE,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-sugarcane" },
      update: {},
      create: {
        id: "crop-sugarcane",
        name: "Sugarcane",
        nameHindi: "गन्ना",
        category: CropCategory.OTHER,
        season: [Season.KHARIF, Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-cabbage" },
      update: {},
      create: {
        id: "crop-cabbage",
        name: "Cabbage",
        nameHindi: "पत्ता गोभी",
        category: CropCategory.VEGETABLE,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-cauliflower" },
      update: {},
      create: {
        id: "crop-cauliflower",
        name: "Cauliflower",
        nameHindi: "फूल गोभी",
        category: CropCategory.VEGETABLE,
        season: [Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-brinjal" },
      update: {},
      create: {
        id: "crop-brinjal",
        name: "Brinjal",
        nameHindi: "बैंगन",
        category: CropCategory.VEGETABLE,
        season: [Season.KHARIF, Season.RABI],
        unit: "quintal",
      },
    }),
    prisma.crop.upsert({
      where: { id: "crop-chilli" },
      update: {},
      create: {
        id: "crop-chilli",
        name: "Chilli",
        nameHindi: "मिर्च",
        category: CropCategory.SPICE,
        season: [Season.KHARIF, Season.RABI],
        unit: "quintal",
      },
    }),
  ]);

  console.log(`✅ ${crops.length} crops seeded`);

  // ── MANDIS ──
  const mandis = await Promise.all([
    prisma.mandi.upsert({
      where: { id: "mandi-indore" },
      update: {},
      create: {
        id: "mandi-indore",
        name: "Indore Mandi",
        nameHindi: "इंदौर मंडी",
        state: "Madhya Pradesh",
        district: "Indore",
        latitude: 22.7196,
        longitude: 75.8577,
        agmarknetId: "MP-IND-001",
        timings: "6:00 AM - 6:00 PM",
        facilities: ["Cold Storage", "Weighing", "Parking", "Bank"],
        rating: 4.2,
      },
    }),
    prisma.mandi.upsert({
      where: { id: "mandi-ujjain" },
      update: {},
      create: {
        id: "mandi-ujjain",
        name: "Ujjain Mandi",
        nameHindi: "उज्जैन मंडी",
        state: "Madhya Pradesh",
        district: "Ujjain",
        latitude: 23.1765,
        longitude: 75.7885,
        agmarknetId: "MP-UJJ-001",
        timings: "6:00 AM - 5:00 PM",
        facilities: ["Weighing", "Parking"],
        rating: 3.9,
      },
    }),
    prisma.mandi.upsert({
      where: { id: "mandi-dewas" },
      update: {},
      create: {
        id: "mandi-dewas",
        name: "Dewas Mandi",
        nameHindi: "देवास मंडी",
        state: "Madhya Pradesh",
        district: "Dewas",
        latitude: 22.9623,
        longitude: 76.0508,
        agmarknetId: "MP-DEW-001",
        timings: "7:00 AM - 5:00 PM",
        facilities: ["Weighing", "Parking"],
        rating: 3.7,
      },
    }),
    prisma.mandi.upsert({
      where: { id: "mandi-khargone" },
      update: {},
      create: {
        id: "mandi-khargone",
        name: "Khargone Mandi",
        nameHindi: "खरगोन मंडी",
        state: "Madhya Pradesh",
        district: "Khargone",
        latitude: 21.8234,
        longitude: 75.6126,
        agmarknetId: "MP-KHA-001",
        timings: "6:30 AM - 5:30 PM",
        facilities: ["Cold Storage", "Weighing"],
        rating: 4.0,
      },
    }),
    prisma.mandi.upsert({
      where: { id: "mandi-bhopal" },
      update: {},
      create: {
        id: "mandi-bhopal",
        name: "Bhopal Mandi",
        nameHindi: "भोपाल मंडी",
        state: "Madhya Pradesh",
        district: "Bhopal",
        latitude: 23.2599,
        longitude: 77.4126,
        agmarknetId: "MP-BHO-001",
        timings: "6:00 AM - 7:00 PM",
        facilities: ["Cold Storage", "Weighing", "Parking", "Bank", "Canteen"],
        rating: 4.5,
      },
    }),
  ]);

  console.log(`✅ ${mandis.length} mandis seeded`);
  console.log("🌾 FasalAI database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
