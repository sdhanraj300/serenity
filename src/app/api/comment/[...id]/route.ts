import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string[] } }
) {
  const eventId = params.id[0];
  try {
    const body = await req.json();
    const { comment, imageUrl, gifUrl, userId, userName } = body;

    const event = await prisma.event.findFirst({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        comment,
        imageUrl,
        gifUrl,
        userId,
        eventId,
        userName,
      },
    });

    if (!newComment) {
      return NextResponse.json(
        { error: "Failed to add comment" },
        { status: 500 }
      );
    }

    const updatedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { comments: true },
    });

    // console.log("New Comment:", newComment);
    // console.log("Updated Event with Comments: ", updatedEvent);
    return NextResponse.json({ updatedEvent });
  } catch (e: any) {
    console.error("Error processing the request:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
