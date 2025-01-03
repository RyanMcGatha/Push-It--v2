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
  description:
    "Push It is a modern real-time messaging application that enables instant communication, file sharing, and seamless collaboration with friends and teams.",
  keywords: [
    "messaging app",
    "real-time chat",
    "instant messaging",
    "collaboration",
    "file sharing",
    "team communication",
  ],
  authors: [{ name: "Push It Team" }],
  openGraph: {
    title: "Push It - Real-time Messaging",
    description: "Modern real-time messaging for seamless communication",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/pushitt.png",
        width: 1200,
        height: 630,
        alt: "Push It Messaging App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Push It - Real-time Messaging",
    description: "Modern real-time messaging for seamless communication",
    images: ["/pushitt.png"],
  },
  icons: {
    icon: "/pushitt.png",
    apple: "/pushitt.png",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
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
