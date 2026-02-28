"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemProps {
  href: string;
  icon: string;
  label: string;
  count?: number;
}

export default function SidebarItem({ href, icon, label, count }: SidebarItemProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-white text-gray-900 font-medium shadow-sm"
          : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active ? "bg-gray-100 text-gray-700" : "bg-gray-200/60 text-gray-500"
        }`}>
          {count}
        </span>
      )}
    </Link>
  );
}
