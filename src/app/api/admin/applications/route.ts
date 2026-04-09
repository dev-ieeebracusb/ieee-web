import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import { MembershipApplication } from "@/models/MembershipApplication";
import { User } from "@/models/User";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  if ((session.user as { role?: string }).role !== "admin") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") ?? 1);
    const limit = 20;

    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    const [applications, total] = await Promise.all([
      MembershipApplication.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ submittedAt: -1 })
        .lean(),
      MembershipApplication.countDocuments(query),
    ]);

    // Merge user info
    const userIds = [...new Set(applications.map((a) => a.userId))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const merged = applications.map((app) => ({
      ...app,
      user: userMap[app.userId] ?? null,
    }));

    return NextResponse.json({ applications: merged, total, page, limit });
  } catch (error) {
    console.error("Admin applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
