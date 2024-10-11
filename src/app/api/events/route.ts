import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const {
    name,
    description,
    type,
    date,
    startTime,
    additionalNotes,
    endTime,
    guestList,
    location,
    invitationSent,
  } = body;

  const userId = token?.sub;
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User does not exist" }, { status: 404 });
  }

  const existingEvent = await prisma.event.findFirst({
    where: {
      userId,
      name,
      location,
      date,
    },
  });

  if (existingEvent) {
    return NextResponse.json(
      { error: "Event already exists" },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const newEvent = await prisma.event.create({
    data: {
      userId,
      name,
      description,
      type,
      date,
      startTime,
      additionalNotes,
      endTime,
      guestList,
      location,
      invitationSent,
    },
  });

  if (newEvent) {
    return NextResponse.json(newEvent, { status: 201 });
  } else {
    return NextResponse.json({ error: "Event not created" }, { status: 500 });
  }
}
