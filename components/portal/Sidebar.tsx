"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/LogoMark";
import { signOut } from "@/lib/auth/actions";
import type { NavSection } from "@/lib/portal/config";

export default function Sidebar({
  companyName,
  top,
  bottom,
}: {
  companyName: string;
  top: NavSection[];
  bottom: NavSection[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:h-screen md:w-60 md:flex-shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:block md:border-b md:border-slate-100 md:px-6 md:py-6">
        <div className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900">
          <LogoMark size={28} />
          <span className="truncate">{companyName}</span>
        </div>
        <span className="rounded bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600 md:mt-3 md:inline-block">
          Client Portal
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:px-3 md:py-4">
        {top.map((link) => (
          <NavItem key={link.key} href={link.href} label={link.label} pathname={pathname} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t border-slate-100 px-3 py-3 md:px-3 md:py-4">
        {bottom.map((link) => (
          <NavItem key={link.key} href={link.href} label={link.label} pathname={pathname} />
        ))}
        <button
          onClick={() => signOut()}
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
