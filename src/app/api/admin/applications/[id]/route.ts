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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const allowedFields = ["status", "adminNotes", "statusMessage"];
    const update: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }

    const updated = await MembershipApplication.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await connectDB();
    const { id } = await params;
    const application = await MembershipApplication.findById(id).lean();
    const user = await User.findById(id).lean()
    if (!application && user!) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const mergedData = {
      ...user,
      ...application,
      mergedAt: new Date().toISOString(),
    };
    return NextResponse.json({ mergedData });
    
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
