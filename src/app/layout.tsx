import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SubAccountProvider } from "@/hooks/useSubAccount";
import { AppShell } from "@/components/layout/AppShell";
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
  title: "GHL Command Center",
  description: "Premium contact and deal record viewer for GoHighLevel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultLocationId = process.env.GHL_DEFAULT_LOCATION_ID || "";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SubAccountProvider defaultLocationId={defaultLocationId}>
          <AppShell>{children}</AppShell>
        </SubAccountProvider>
        <Toaster />
      </body>
    </html>
  );
}
