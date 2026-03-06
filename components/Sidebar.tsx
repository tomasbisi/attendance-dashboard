"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Attendance", href: "/", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`flex-shrink-0 border-r bg-card flex flex-col transition-all duration-200 ease-in-out ${expanded ? "w-56" : "w-16"}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Branding */}
      <div className={`border-b flex items-center overflow-hidden transition-all duration-200 ${expanded ? "px-5 py-4" : "px-0 py-4 justify-center"}`}>
        <Image
          src="/hk-logo.jpg"
          alt="HOKALI"
          width={36}
          height={36}
          className="object-contain flex-shrink-0 border border-black rounded-lg p-1"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                expanded ? "px-2" : "justify-center px-0"
              } ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {expanded && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logo */}
      {expanded && (
        <div className="px-4 py-4 border-t flex justify-center">
          <Image
            src="/hokali.jpg"
            alt="HOKALI"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      )}
    </aside>
  );
}
