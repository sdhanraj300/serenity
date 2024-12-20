import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { eventId } }: { params: { eventId: string } }
) {
  console.log("Event ID:", eventId);
  const findEvent = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
    include: {
      comments: true, //this is very important as mongodb does not automatically include the comments because it is a separate collection and only event is queried by default and comments are not included in the response by default. They are just related to the event.
    },
  });
  if (!findEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event: findEvent }, { status: 200 });
}
export async function DELETE(
  req: NextRequest,
  { params: { eventId } }: { params: { eventId: string } }
) {
  console.log("Event ID:", eventId);
  const deleteEvent = await prisma.event.delete({
    where: {
      id: eventId,
    },
  });
  if (!deleteEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Event deleted" }, { status: 200 });
}
export async function PATCH(
  req: NextRequest,
  { params: { eventId } }: { params: { eventId: string } }
) {
  const body = await req.json();
  const {
    name,
    description,
    type,
    date,
    startTime,
    additionalNotes,
    endTime,
    location,
    guestList,
    invitationSent,
    activities,
    coverImage,
  } = body;
  const updateEvent = await prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      name,
      description,
      type,
      date,
      startTime,
      additionalNotes,
      endTime,
      location,
      guestList,
      invitationSent,
      activities,
      coverImage,
    },
  });
  if (!updateEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Event updated" }, { status: 200 });
}
