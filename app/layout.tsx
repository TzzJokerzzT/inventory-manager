import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthWrapper } from "@/lib/auth/presentation/auth-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Referral Creator",
  description: "Referral management application",
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
      <body className="min-h-full flex flex-col">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
