import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthWrapper } from "@/lib/auth/presentation/auth-wrapper";
import { MockAuthWrapper } from "@/lib/auth/presentation/mock-auth-wrapper";
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
  title: "Inventory Manager",
  description: "Sistema de gestión de inventarios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const useMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
  const AuthComponent = useMockAuth ? MockAuthWrapper : AuthWrapper;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthComponent>{children}</AuthComponent>
      </body>
    </html>
  );
}
