import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import { MembershipApplication } from "@/models/MembershipApplication";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      membershipType,
      memberType,
      hasIeeeAccount,
      ieeeAccountEmail,
      ieeeAccountPassword,
      chapters,
      ieeeMembershipFee,
      totalAmount,
      paymentMethod,
      transactionId,
    } = body;

    if (!membershipType || !chapters?.length || !paymentMethod || !transactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const application = await MembershipApplication.create({
      userId: session.user.id,
      membershipType,
      memberType,
      hasIeeeAccount,
      ieeeAccountEmail,
      ieeeAccountPassword,
      chapters,
      ieeeMembershipFee: ieeeMembershipFee ?? 0,
      totalAmount,
      paymentMethod,
      transactionId,
      status: "pending",
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Membership submit error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const applications = await MembershipApplication.find({
      userId: session.user.id,
    }).sort({ submittedAt: -1 });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Fetch membership error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
