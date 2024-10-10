"use server";

import { signIn } from "@/auth";
export const handleGoogleSignIn = async () => {
  await signIn("google", { callbackUrl: "/" });
};
