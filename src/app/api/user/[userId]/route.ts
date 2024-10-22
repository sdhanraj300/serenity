import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        avatar: true,
        hobbies: true,
        bio: true,  
        events: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (err: any) {
    console.error(err);
  }
}
export async function PUT(
  req: NextRequest,
  { params: { userId } }: { params: { userId: string } }
) {
  try {
    const { name, email, age, hobbies,bio,avatar } = await req.json();
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        age,
        hobbies,
        bio,
        avatar
      },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (err: any) {
    console.error(err);
  }
}
