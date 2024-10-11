import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }
        const user = await prisma.user.findFirst({
          where: { email },
        });
        // console.log("User:", user);
        // console.log("Password:",password);
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider === "google") {
        try {
          const email = user?.email;
          const name = user?.name;
          const googleId = account.providerAccountId;
          const avatar = profile?.picture || profile?.image;

          if (!email) {
            throw new Error("Google sign-in failed: Email not provided");
          }
          const existingUser = await prisma.user.findFirst({
            where: { email },
          });
          if (existingUser) {
            user.id = existingUser.id;
            return true;
          }
          const newUser = await prisma.user.create({
            data: {
              email,
              name: name || "Anonymous",
              googleId,
              avatar,
            },
          });
          user.id = newUser.id;
          return true;
        } catch (err) {
          console.error("Google sign-in error:", err);
          return false;
        }
      }

      return true;
    },

    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    session: async ({ session, token }) => {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
});
