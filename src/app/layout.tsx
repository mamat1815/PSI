// src/app/layout.tsx
import "~/styles/globals.css";
import { Inter, Kodchasan } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { NextAuthProvider } from "./_components/NextAuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const kodchasan = Kodchasan({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-kodchasan",
});

export const metadata = {
  title: "UACAD",
  description: "Sistem Informasi Jadwal Kegiatan Mahasiswa dan Organisasi",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${kodchasan.variable}`}>
        <TRPCReactProvider>
          <NextAuthProvider>{children}</NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}