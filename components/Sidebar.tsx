"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BarChart2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Attendance", href: "/", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card flex flex-col">
      {/* Branding */}
      <div className="px-5 py-5 border-b">
        <span className="text-base font-bold tracking-tight">HOKALI</span>
        <p className="text-xs text-muted-foreground mt-0.5">Reporting</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logo */}
      <div className="px-4 py-4 border-t flex justify-center">
        <Image
          src="/hokali.jpg"
          alt="HOKALI"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
    </aside>
  );
}
