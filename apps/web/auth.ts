import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@repo/prisma";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
          select: { id: true, email: true, password: true },
        });

        if (!user || !(await compare(credentials!.password, user.password))) {
          return null;
        }

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 60 * 60 * 24, // 7 days
    updateAge: 4 * 60 * 60,   // 4 hours
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first login
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
    
      // Always generate or refresh API token
      if (!token.apiAccessToken) {
        token.apiAccessToken = jwt.sign(
          { id: token.id, email: token.email },
          process.env.API_JWT_SECRET!,
          { expiresIn: "1h" }
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      session.apiAccessToken = token.apiAccessToken as string;
      return session;
    }
  }
};