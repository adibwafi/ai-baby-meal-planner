import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Baby Meal Planner — Smart Fridge MPASI Optimizer",
    template: "%s | AI Baby Meal Planner",
  },
  description:
    "Solusi AI Meal Planner MPASI Bayi & Balita (6-24 Bulan) untuk Ibu Bekerja. Generate 5 matriks menu harian gizi seimbang dari stok bahan kulkas dalam 30 detik. Bebas Stunting, Praktis Subuh Hari, & Teruji Klinis.",
  keywords: [
    "AI Baby Meal Planner",
    "Smart Fridge MPASI",
    "MPASI AI",
    "Resep MPASI Bayi",
    "Menu MPASI 6 Bulan",
    "Menu MPASI 8 Bulan",
    "Menu MPASI 9 Bulan",
    "Menu MPASI 12 Bulan",
    "Perencana Makanan Bayi",
    "Cegah Stunting AI",
    "Resep MPASI Praktis Subuh",
    "MPASI Ibu Bekerja",
  ],
  authors: [{ name: "AI Baby Meal Planner Team" }],
  creator: "AI Baby Meal Planner",
  applicationName: "AI Baby Meal Planner",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI Baby Meal Planner",
  },
  openGraph: {
    title: "AI Baby Meal Planner — Smart Fridge MPASI Optimizer",
    description:
      "Generate 5 matriks menu MPASI bayi (6-24 Bulan) gizi seimbang dalam 30 detik dari stok kulkas. Didesain khusus untuk Ibu Bekerja tanpa pembantu.",
    url: "https://ai-baby-meal-planner-beta.vercel.app",
    siteName: "AI Baby Meal Planner",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "AI Baby Meal Planner Icon",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Baby Meal Planner — Smart Fridge MPASI Optimizer",
    description:
      "Generate 5 matriks menu MPASI bayi gizi seimbang dari bahan kulkas dalam 30 detik.",
    images: ["/icon-512.png"],
  },
  metadataBase: new URL("https://ai-baby-meal-planner-beta.vercel.app"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
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
        {/* PWA & Mobile Web App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Baby Meal Planner" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
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
