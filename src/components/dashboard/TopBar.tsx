"use client";

import { Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/membership": "Membership",
  "/dashboard/projects": "Projects",
  "/dashboard/settings": "Settings",
  "/dashboard/admin/members": "Members",
  "/dashboard/admin/applications": "Applications",
};

interface TopBarProps {
  user: { name: string; email: string };
}

export default function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Dashboard";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <User size={17} />
        </button>
        <div className="hidden sm:block text-right">
          <p className="text-xs font-semibold text-gray-800">{user.name}</p>
          <p className="text-[11px] text-gray-400">{user.email}</p>
        </div>
      </div>
    </header>
  );
}
