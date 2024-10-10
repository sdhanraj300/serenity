import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const { guestList, eventId } = body;
  console.log("Guest List:", guestList);
  console.log("Event ID:", eventId);
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    const guestUpdatePromises = guestList.map(async (guest: string) => {
      try {
        await prisma.guest.create({
          data: {
            email: guest,
            eventId: event.id,
            status: "PENDING",
          },
        });
      } catch (error) {
        console.error(`Failed to insert guest: ${guest}`, error);
        throw new Error(`Failed to insert guest: ${guest}`);
      }
    });
    await Promise.all(guestUpdatePromises);
    const emailPromises = guestList.map(async (guest: string) => {
      transporter.sendMail({
        from: "dhanraj02025@gmail.com",
        to: guest,
        subject: "You have been invited to an event",
        text: `You have been invited to an event called ${event.name}. The event will take place on ${event.date} at ${event.location}.`,
      });
    });
    await Promise.all(emailPromises);
    return NextResponse.json({ message: "Invitations sent" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
