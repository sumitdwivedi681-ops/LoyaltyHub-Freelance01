import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "LoyaltyHub — Earn. Redeem. Reward.",
  description:
    "A modern SaaS loyalty management platform. Earn points, redeem rewards, and grow your customer base with powerful analytics.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "LoyaltyHub" },
  keywords: ["loyalty", "rewards", "points", "SaaS", "customer retention"],
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e1e3a',
                color: '#fff',
                border: '1px solid rgba(99,102,241,0.3)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
