import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const events = await prisma.event.findMany({
      where: {
        userId,
      },
    });
    if (!events) {
      return NextResponse.json({ error: "No events found" }, { status: 404 });
    }
    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
