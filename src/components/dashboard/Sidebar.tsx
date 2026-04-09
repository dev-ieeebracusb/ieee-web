"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FolderKanban,
  Settings,
  Users,
  FileText,
  Phone,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

interface SidebarProps {
  user: { name: string; email: string; role?: string };
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Membership", href: "/dashboard/membership", icon: CreditCard },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminItems = [
  { label: "Members", href: "/dashboard/admin/members", icon: Users },
  { label: "Applications", href: "/dashboard/admin/applications", icon: FileText },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user.role === "admin";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="w-[240px] shrink-0 bg-white h-full flex flex-col shadow-[2px_0_12px_rgba(0,0,0,0.04)]">
      {/* User profile */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            {isAdmin ? (
              <span className="inline-block bg-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5">
                Admin
              </span>
            ) : (
              <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5">
                Student
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Admin Access
              </p>
            </div>
            {adminItems.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Contact Us card + Sign out */}
      <div className="p-3 space-y-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 text-white">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Phone size={16} className="text-white" />
          </div>
          <p className="font-semibold text-sm">Contact Us</p>
          <p className="text-xs text-blue-100 mt-0.5">For any assistance</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
