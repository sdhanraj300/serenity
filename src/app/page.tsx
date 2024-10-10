"use client";
import HeroBanner from "@/components/HeroBanner";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  // const { data: session, status } = useSession();
  // console.log(session?.user?.email, status);
  // const email = session?.user?.email;
  // useEffect(() => {
  //   const findId = async () => {
  //     const response = await fetch("/api/auth/findId", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   };
  //   findId();
  // }, [email]);
  // if (status === "loading") {
  //   return <div>Loading...</div>; // While session data is being fetched
  // }

  return (
    <div>
      <HeroBanner />
    </div>
  );
}
