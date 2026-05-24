// src/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Fetch user with their crops
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      crops: {
        include: {
          crop: true,
          mandi: true,
        },
      },
      alerts: {
        where: { isActive: true },
        include: { crop: true },
      },
    },
  });

  if (!user) redirect("/sign-in");

  // Fetch latest prices for user's crops
  const latestPrices = await prisma.priceRecord.findMany({
    where: {
      cropId: { in: user.crops.map((uc) => uc.cropId) },
    },
    include: {
      crop: { select: { name: true, nameHindi: true, unit: true } },
      mandi: { select: { name: true, nameHindi: true } },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  // Fetch all crops & mandis for add-crop modal
  const allCrops = await prisma.crop.findMany({ orderBy: { name: "asc" } });
  const allMandis = await prisma.mandi.findMany({ orderBy: { name: "asc" } });

  return (
    <DashboardClient
      user={user as any}
      latestPrices={latestPrices as any}
      allCrops={allCrops as any}
      allMandis={allMandis as any}
    />
  );
}
