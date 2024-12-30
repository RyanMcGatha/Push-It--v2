import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/utils/theme-provider";
import { Toaster } from "react-hot-toast";
import { NextAuthProvider } from "@/app/utils/next-auth-provider";
import { ToastProvider } from "@/components/ui/toast";

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
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  zIndex: 9999,
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
            {children}
          </ThemeProvider>
        </NextAuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
