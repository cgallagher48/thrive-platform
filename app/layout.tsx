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
  title: 'Thrive Automation Agency | AI Systems for Modern Business',
  description: 'AI-powered automation systems for modern businesses. We build custom AI workflows that save time, generate leads, and scale your operations.',
  openGraph: {
    title: 'Thrive Automation Agency | AI Systems for Modern Business',
    description: 'We build custom AI automation systems that recover missed leads, streamline operations, and scale revenue. Serving Chicago and beyond.',
    url: 'https://www.thriveautomation.agency',
    siteName: 'Thrive Automation Agency',
    type: 'website',
    images: [{ url: '/logo.png' , width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thrive Automation Agency',
    description: 'AI-powered automation for modern businesses.',
  },
  icons: {
    icon: '/favicon.ico',
  },
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

