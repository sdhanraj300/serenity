import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(
  req: NextRequest,
  { params: { guestId } }: { params: { guestId: string } }
) {
  console.log("Guest ID:", guestId);
  const findGuest = await prisma.guest.findFirst({
    where: {
      id: guestId,
    },
  });
  if (!findGuest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  return NextResponse.json({ guest: findGuest }, { status: 200 });
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: { guestId: string };
  }
) {
  const body = await req.json();
  const { response } = body;
  const { guestId } = params;
  console.log("Guest ID:", guestId);
  try {
    const guest = await prisma.guest.findFirst({
      where: {
        id: guestId,
      },
    });
    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }
    if (response === "Yes") {
      await prisma.guest.update({
        where: {
          id: guestId,
        },
        data: {
          status: "ACCEPTED",
          responsedAt: new Date(),
        },
      });
      return NextResponse.json(
        { message: "Response updated" },
        { status: 200 }
      );
    } else if (response === "Not") {
      await prisma.guest.update({
        where: {
          id: guestId,
        },
        data: {
          status: "DECLINED",
          responsedAt: new Date(),
        },
      });
      return NextResponse.json(
        { message: "Response updated" },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  return NextResponse.json({ message: "Response updated" }, { status: 200 });
}
