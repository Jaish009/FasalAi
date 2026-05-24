import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { cropId, mandiId } = await req.json();

    if (!cropId) {
      return new NextResponse("Missing cropId", { status: 400 });
    }

    const userCrop = await prisma.userCrop.create({
      data: {
        userId: user.id,
        cropId,
        mandiId: mandiId || null,
      },
      include: {
        crop: true,
        mandi: true,
      }
    });

    return NextResponse.json(userCrop);
  } catch (error) {
    console.error("POST /api/crops/my error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing id", { status: 400 });
    }

    // Ensure the crop belongs to the user before deleting
    const userCrop = await prisma.userCrop.findUnique({
      where: { id },
    });

    if (!userCrop || userCrop.userId !== user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    await prisma.userCrop.delete({
      where: { id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("DELETE /api/crops/my error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
