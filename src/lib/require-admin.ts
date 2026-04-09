import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") redirect("/dashboard");
  return session;
}
