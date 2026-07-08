import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Fridge MPASI Optimizer",
  description:
    "AI-powered 5-meal daily matrix for toddlers — generate a full day of balanced MPASI meals from your fridge ingredients in seconds. Built for busy working parents.",
  keywords: ["MPASI", "toddler food", "meal planner", "AI", "baby food", "Indonesia"],
  authors: [{ name: "Smart Fridge MPASI" }],
  creator: "Smart Fridge MPASI Optimizer",
  applicationName: "MPASI AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MPASI AI",
  },
  openGraph: {
    title: "Smart Fridge MPASI Optimizer",
    description: "AI-powered toddler meal planner for busy working parents",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#FFFDF6" },
    { media: "(prefers-color-scheme: light)", color: "#FFFDF6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <head>
        {/* Apple PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MPASI AI" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
      </head>
      <body className="h-full antialiased">
        {/* Mobile-first container on mobile — max 480px, responsive desktop layouts on wider screens */}
        <div className="relative mx-auto flex min-h-full flex-col overflow-hidden w-full max-w-[480px] md:max-w-none">
          {children}
        </div>
      </body>
    </html>
  );
}
