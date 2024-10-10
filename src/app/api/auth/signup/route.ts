import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name } = body;
  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Please enter all the details" },
      {
        status: 400,
      }
    );
  }
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (user) {
    return NextResponse.json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });
  if (newUser) {
    return NextResponse.json(
      {
        success: "User created successfully",
        user: newUser,
      },
      {
        status: 201,
      }
    );
  } else {
    return NextResponse.json(
      { error: "User creation failed" },
      {
        status: 500,
      }
    );
  }
}
