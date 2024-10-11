import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guestList, eventId } = body;
  console.log("Guest List:", guestList);
  console.log("Event ID:", eventId);
  try {
    const guestListForMails = [] as { id: string; email: string }[];
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
      },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    const guestCreationPromises = guestList.map(async (guest: string) => {
      try {
        const res = await prisma.guest.create({
          data: {
            email: guest,
            eventId: event.id,
            status: "PENDING",
          },
        });
        guestListForMails.push({ id: res.id, email: res.email });
      } catch (error) {
        console.error(`Failed to insert guest: ${guest}`, error);
        throw new Error(`Failed to insert guest: ${guest}`);
      }
    });
    await Promise.all(guestCreationPromises);
    console.log("Guest List for Mails:", guestListForMails);

    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
    const emailPromises = guestListForMails.map(async ({ id, email }) => {
      const rsvpLink = `https:serenityevents.vercel.app/${event.id}/${id}`; // Unique RSVP link

      await transporter.sendMail({
        from: "dhanraj02025@gmail.com",
        to: email,
        subject: "You have been invited to an event",
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Invitation</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 90%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                h1 {
                    color: #2c3e50;
                    font-size: 24px;
                    margin: 0;
                    padding: 0;
                }
                p {
                    line-height: 1.5;
                    font-size: 16px;
                    margin: 10px 0;
                }
                .button {
                    display: inline-block;
                    background-color: #2980b9;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: #3498db;
                }
                .footer {
                    font-size: 14px;
                    color: #777;
                    text-align: center;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>You Are Invited to an Event!</h1>
                <p>Dear Guest,</p>
                <p>We are thrilled to invite you to <strong>${event?.name}</strong>.</p>
                <p>The event will take place on <strong>${event.date}</strong> at <strong>${event.location}</strong>.</p>
                <p>The Event will start at <strong>${event.startTime}</strong> and end at <strong>${event.endTime}</strong>.</p>
                <p>We hope to see you there!</p>
                <a href="${rsvpLink}" class="button">RSVP Now</a>
                <div class="footer">
                    <p>Best Regards,</p>
                    <p>Serenity Events</p>
                </div>
            </div>
        </body>
        </html>`,
      });
    });
    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return NextResponse.json({ message: "Invitations sent" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
