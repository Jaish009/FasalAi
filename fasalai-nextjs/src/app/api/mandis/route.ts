// src/app/api/mandis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/mandis?state=&district=&lat=&lng=&radius=50
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    const district = searchParams.get("district");
    const search = searchParams.get("search");
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");

    const mandis = await prisma.mandi.findMany({
      where: {
        ...(state && { state: { contains: state, mode: "insensitive" } }),
        ...(district && { district: { contains: district, mode: "insensitive" } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nameHindi: { contains: search } },
            { district: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { rating: "desc" },
    });

    // Sort by distance if coordinates provided
    let result = mandis;
    if (lat && lng) {
      result = mandis
        .map((m) => ({
          ...m,
          distance: getDistanceKm(lat, lng, m.latitude, m.longitude),
        }))
        .sort((a, b) => (a as any).distance - (b as any).distance) as any;
    }

    return NextResponse.json({ mandis: result, total: result.length });
  } catch (error) {
    console.error("GET /api/mandis error:", error);
    return NextResponse.json({ error: "Failed to fetch mandis" }, { status: 500 });
  }
}

// Haversine distance formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
