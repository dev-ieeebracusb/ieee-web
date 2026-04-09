import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar user={session.user as { name: string; email: string; role?: string }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={session.user as { name: string; email: string }} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
