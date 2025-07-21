import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Forge",
  description: "Task management app",
};

async function getCurrentUserEmail(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return undefined;
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id: session }, select: { email: true } });
  return user?.email;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const email = await getCurrentUserEmail();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <Header email={email} />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
