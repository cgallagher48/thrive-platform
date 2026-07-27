import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL('https://www.thriveautomation.agency'),
  title: 'Thrive Automation Agency | Intelligent Operations Systems',
  description: 'We build intelligent operations systems — one dashboard, an AI brain, and automation engines configured to your business.',
  openGraph: {
    title: 'Thrive Automation Agency | Intelligent Operations Systems',
    description: 'We build intelligent operations systems — one dashboard, an AI brain, and automation engines configured to your business.',
    url: 'https://www.thriveautomation.agency',
    siteName: 'Thrive Automation Agency',
    type: 'website',
    images: [{ url: '/logo.png' , width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thrive Automation Agency',
    description: 'We build intelligent operations systems — one dashboard, an AI brain, and automation engines configured to your business.',
  },
  // Icons are intentionally NOT set here — an explicit `icons` field
  // overrides Next's file-convention auto-detection entirely (and since it
  // only names one icon, the apple-touch-icon link never gets added
  // either). app/icon.png and app/apple-icon.png are picked up
  // automatically instead. See scripts/generate-icons.mjs.
}

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

