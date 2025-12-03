import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";
import ThemeRegistry from "@/theme/ThemeRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Megyk Dashboard - Books & Sales Campaign",
  description: "Manage book summaries and track German dentist lead generation campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: geistSans.style.fontFamily }}>
        <ThemeRegistry>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
