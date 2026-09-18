"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, TrendingUp, Activity, Settings } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/picks",    label: "Picks",     Icon: TrendingUp },
  { href: "/dashboard/live",     label: "En vivo",   Icon: Activity },
  { href: "/dashboard/settings", label: "Ajustes",   Icon: Settings },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-white">
          Pick<span className="text-brand-500">Genius</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === href
                  ? "bg-brand-500/15 text-brand-400"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2.5 py-1.5 rounded-full">
          <span className="live-dot" style={{ width: 6, height: 6 }}></span>
          Engine activo
        </div>
        <UserButton afterSignOutUrl="/" appearance={{
          elements: {
            avatarBox: "w-8 h-8 ring-1 ring-brand-500/30"
          }
        }} />
      </div>
    </nav>
  );
}
