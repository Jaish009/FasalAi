// src/app/api/prices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAgmarknetPrices } from "@/lib/agmarknet";
import { subDays } from "date-fns";

// GET /api/prices?cropId=&mandiId=&days=30
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId");
    const mandiId = searchParams.get("mandiId");
    const days = parseInt(searchParams.get("days") || "30");
    const latest = searchParams.get("latest") === "true";

    if (!cropId) {
      return NextResponse.json({ error: "cropId is required" }, { status: 400 });
    }

    const dateFrom = subDays(new Date(), days);

    // Fetch from DB
    const prices = await prisma.priceRecord.findMany({
      where: {
        cropId,
        ...(mandiId && { mandiId }),
        date: { gte: dateFrom },
      },
      include: {
        crop: { select: { name: true, nameHindi: true, unit: true } },
        mandi: { select: { name: true, nameHindi: true, district: true, state: true } },
      },
      orderBy: { date: "desc" },
      ...(latest && { take: 1 }),
    });

    // If no data in DB, fetch live from Agmarknet
    if (prices.length === 0) {
      const crop = await prisma.crop.findUnique({ where: { id: cropId } });
      const mandi = mandiId ? await prisma.mandi.findUnique({ where: { id: mandiId } }) : null;

      if (crop) {
        const livePrices = await fetchAgmarknetPrices({
          commodity: crop.name,
          state: mandi?.state,
          district: mandi?.district,
        });

        return NextResponse.json({
          prices: livePrices,
          source: "agmarknet-live",
          total: livePrices.length,
        });
      }
    }

    // Calculate price change
    const latestPrice = prices[0]?.price || 0;
    const previousPrice = prices[1]?.price || latestPrice;
    const priceChange = previousPrice ? ((latestPrice - previousPrice) / previousPrice) * 100 : 0;

    return NextResponse.json({
      prices,
      source: "database",
      total: prices.length,
      latestPrice,
      priceChange: parseFloat(priceChange.toFixed(2)),
      trend: priceChange > 0 ? "RISING" : priceChange < 0 ? "FALLING" : "STABLE",
    });
  } catch (error) {
    console.error("GET /api/prices error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
