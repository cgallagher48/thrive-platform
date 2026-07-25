"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard/today", label: "Today" },
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/inbox", label: "Inbox" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/library", label: "Library" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/money", label: "Money" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/brain", label: "The Brain" },
  { href: "/dashboard/engines", label: "Engines" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

const BOTTOM_NAV_LINKS = [
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/setup", label: "Setup" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/dashboard/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:h-screen md:w-60 md:flex-shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:block md:border-b md:border-slate-100 md:px-6 md:py-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          <Image src="/logo.png" alt="Thrive Automation logo" width={28} height={28} className="h-7 w-7" />
          Thrive
        </Link>
        <span className="rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600 md:mt-3 md:inline-block">
          Demo Portal
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:px-3 md:py-4">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} pathname={pathname} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 px-3 py-3 md:px-3 md:py-4">
        {BOTTOM_NAV_LINKS.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} pathname={pathname} />
        ))}
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}
