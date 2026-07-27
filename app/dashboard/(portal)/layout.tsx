import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/portal/Sidebar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getNavSections } from "@/lib/portal/config";

export const metadata: Metadata = {
  title: "Client Portal | Thrive Automation Agency",
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts already guarantees a valid session reaches here — this is
  // defense in depth against a missing/broken profile row, not the primary
  // gate.
  const user = await getCurrentUser();
  if (!user) redirect("/dashboard/login");

  if (user.mustChangePassword) redirect("/dashboard/account/set-password");

  const { top, bottom } = getNavSections(user.company.config);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <Sidebar companyName={user.company.name} top={top} bottom={bottom} />
      <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
