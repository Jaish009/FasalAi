// src/app/api/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const AlertSchema = z.object({
  cropId: z.string(),
  mandiId: z.string().optional(),
  targetPrice: z.number().positive(),
  condition: z.enum(["ABOVE", "BELOW"]),
  channels: z.array(z.enum(["SMS", "WHATSAPP", "EMAIL"])).min(1),
});

// GET /api/alerts — Get user's alerts
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      include: {
        crop: { select: { name: true, nameHindi: true, category: true } },
        user: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts, total: alerts.length });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST /api/alerts — Create a new alert
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsed = AlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.errors }, { status: 400 });
    }

    const { cropId, mandiId, targetPrice, condition, channels } = parsed.data;

    // Check for duplicate active alert
    const existing = await prisma.alert.findFirst({
      where: { userId: user.id, cropId, condition, isActive: true, triggered: false },
    });
    if (existing) {
      return NextResponse.json({ error: "An active alert for this crop already exists" }, { status: 409 });
    }

    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        cropId,
        mandiId,
        targetPrice,
        condition,
        channels,
      },
      include: {
        crop: { select: { name: true, nameHindi: true } },
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

// DELETE /api/alerts?id= — Delete an alert
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get("id");
    if (!alertId) return NextResponse.json({ error: "Alert ID required" }, { status: 400 });

    // Verify ownership
    const alert = await prisma.alert.findFirst({ where: { id: alertId, userId: user.id } });
    if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

    await prisma.alert.delete({ where: { id: alertId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
