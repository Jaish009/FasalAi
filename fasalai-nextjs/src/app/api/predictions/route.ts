// src/app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;
const ML_SECRET = process.env.ML_SERVICE_SECRET;

// GET /api/predictions?cropId=&mandiId=&horizon=7
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId");
    const mandiId = searchParams.get("mandiId");
    const horizon = parseInt(searchParams.get("horizon") || "7");

    if (!cropId) {
      return NextResponse.json({ error: "cropId is required" }, { status: 400 });
    }

    // Check DB for recent prediction (within last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const targetDate = new Date(Date.now() + horizon * 24 * 60 * 60 * 1000);

    const existing = await prisma.pricePrediction.findFirst({
      where: {
        cropId,
        ...(mandiId && { mandiId }),
        horizon,
        createdAt: { gte: sixHoursAgo },
      },
      include: {
        crop: { select: { name: true, nameHindi: true } },
        mandi: { select: { name: true, nameHindi: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({ prediction: existing, cached: true });
    }

    // Call Python ML service for fresh prediction
    if (ML_SERVICE_URL && mandiId) {
      try {
        const mlResponse = await axios.post(
          `${ML_SERVICE_URL}/predict`,
          { crop_id: cropId, mandi_id: mandiId, horizon },
          {
            headers: { Authorization: `Bearer ${ML_SECRET}` },
            timeout: 15000,
          }
        );

        const { predicted_price, confidence, trend, min_price, max_price } = mlResponse.data;

        // Save prediction to DB
        const prediction = await prisma.pricePrediction.upsert({
          where: {
            cropId_mandiId_targetDate_horizon: {
              cropId,
              mandiId,
              targetDate,
              horizon,
            },
          },
          update: {
            predictedPrice: predicted_price,
            confidence,
            trend,
            minPrice: min_price,
            maxPrice: max_price,
          },
          create: {
            cropId,
            mandiId,
            predictedPrice: predicted_price,
            confidence,
            trend,
            minPrice: min_price,
            maxPrice: max_price,
            targetDate,
            horizon,
          },
          include: {
            crop: { select: { name: true, nameHindi: true } },
            mandi: { select: { name: true, nameHindi: true } },
          },
        });

        return NextResponse.json({ prediction, cached: false });
      } catch (mlError) {
        console.error("ML service error:", mlError);
        // Fall through to mock prediction
      }
    }

    // Fallback: simple mock prediction based on recent price history
    const recentPrices = await prisma.priceRecord.findMany({
      where: { cropId, ...(mandiId && { mandiId }) },
      orderBy: { date: "desc" },
      take: 30,
    });

    if (recentPrices.length === 0) {
      return NextResponse.json({ error: "No price data available for prediction" }, { status: 404 });
    }

    const avgPrice = recentPrices.reduce((s, p) => s + p.price, 0) / recentPrices.length;
    const latestPrice = recentPrices[0].price;
    const trend = latestPrice > avgPrice ? "RISING" : latestPrice < avgPrice ? "FALLING" : "STABLE";
    const trendFactor = trend === "RISING" ? 1.03 : trend === "FALLING" ? 0.97 : 1.0;
    const predictedPrice = Math.round(latestPrice * trendFactor);

    return NextResponse.json({
      prediction: {
        cropId,
        mandiId,
        predictedPrice,
        confidence: 75,
        trend,
        horizon,
        targetDate,
        minPrice: predictedPrice * 0.95,
        maxPrice: predictedPrice * 1.05,
      },
      cached: false,
      source: "fallback",
    });
  } catch (error) {
    console.error("GET /api/predictions error:", error);
    return NextResponse.json({ error: "Failed to get prediction" }, { status: 500 });
  }
}
