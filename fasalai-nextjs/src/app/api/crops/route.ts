// src/app/api/crops/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET /api/crops — List all crops (optionally filter by category/season)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const season = searchParams.get("season");
    const search = searchParams.get("search");

    const crops = await prisma.crop.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(season && { season: { has: season as any } }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nameHindi: { contains: search } },
          ],
        }),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ crops, total: crops.length });
  } catch (error) {
    console.error("GET /api/crops error:", error);
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 });
  }
}
