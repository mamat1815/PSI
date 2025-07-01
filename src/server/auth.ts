// src/server/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

// Perbarui tipe data agar `role` dan `id` tersedia di sesi
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
    // Menyimpan `role` dan `id` di dalam token JWT
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "Mahasiswa";
      }
      return token;
    },
    // Mengambil data dari token JWT untuk digunakan di sisi klien
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
        
        // 1. Coba cari di tabel Organisasi
        const organization = await db.organisasi.findUnique({ where: { email: credentials.email as string }});
        if (organization) {
          const isValid = await bcrypt.compare(credentials.password as string, organization.password);
          if (isValid) return { id: organization.id, name: organization.name, email: organization.email, image: organization.logo, role: "Organisasi" };
        }

        // 2. Jika tidak ketemu, cari di tabel User (Mahasiswa/Staff)
        const user = await db.user.findUnique({ where: { email: credentials.email as string }});
        if (user?.password) {
          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (isValid) return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
        }
        
        // 3. Jika tidak ditemukan di mana pun, gagalkan login
        return null;
      }
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: '/login' },
});
