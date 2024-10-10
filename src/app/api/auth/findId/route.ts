import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
interface RequestBody {
  email: string;
}
export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();

    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (user) {
      return NextResponse.json({ id: user.id }, { status: 200 });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error finding user:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
