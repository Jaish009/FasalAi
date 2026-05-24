// src/app/api/users/sync/route.ts
// Called by Clerk webhook + middleware to sync user data
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Farmer";
    const phone = clerkUser.phoneNumbers[0]?.phoneNumber || null;

    // Upsert user in DB
    const isNew = !(await prisma.user.findUnique({ where: { clerkId } }));

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { name, email, phone },
      create: { clerkId, name, email, phone },
    });

    // Send welcome email to new users
    if (isNew && email) {
      await sendWelcomeEmail({ to: email, userName: name });
    }

    return NextResponse.json({ user, isNew });
  } catch (error) {
    console.error("POST /api/users/sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
