import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userEmail } }: { params: { userEmail: string } }
) {
  try {
    const invitedEvents = await prisma.guest.findMany({
      where: { email: userEmail },
    });
    console.log(invitedEvents);
    if (!invitedEvents) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(invitedEvents, { status: 200 });
  } catch (err: any) {
    console.error(err);
  }
}
