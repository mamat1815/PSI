import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "Mahasiswa" | "StaffKampus" | "Organisasi";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "Mahasiswa" | "StaffKampus" | "Organisasi";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "Mahasiswa" | "StaffKampus" | "Organisasi";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "Mahasiswa";
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "Mahasiswa" | "StaffKampus" | "Organisasi";
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const organization = await db.organisasi.findUnique({ 
          where: { email: credentials.email as string }
        });
        if (organization) {
          const isValid = await bcrypt.compare(
            credentials.password as string,
            organization.password
          );
          if (isValid) return {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            image: organization.logo,
            role: "Organisasi"
          };
        }

        const user = await db.user.findUnique({ 
          where: { email: credentials.email as string }
        });
        if (user?.password) {
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );
          if (isValid) return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role
          };
        }
        return null;
      }
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
});
