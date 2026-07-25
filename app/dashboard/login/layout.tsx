import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Thrive Automation Agency",
  robots: { index: false, follow: false },
};

export default function DashboardLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
