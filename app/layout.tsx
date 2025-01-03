import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/utils/theme-provider";
import { Toaster } from "sonner";
import { NextAuthProvider } from "@/app/utils/next-auth-provider";
import { NotificationProvider } from "@/app/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Push It - Real-time Messaging",
  description: "A modern real-time messaging application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <Toaster />
              {children}
            </NotificationProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
