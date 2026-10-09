import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LenisProvider from "../components/LenisProvider";
import Background3D from "../components/Background3D";
import CustomCursor from "../components/CustomCursor";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClearGig - Estimate Manager",
  description: "Calculate, manage, and export cost estimates for freelance projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col cursor-none">
        <CustomCursor />
        <Background3D />
        <nav className="fixed top-8 left-8 z-50 flex gap-8">
          <Link href="/" className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors cursor-none">Estimator</Link>
          <Link href="/dashboard" className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors cursor-none">Command Center</Link>
        </nav>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}


