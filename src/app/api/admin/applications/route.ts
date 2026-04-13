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
    const search = searchParams.get("search"); // ADDED: Extract search param
    const page = Number(searchParams.get("page") ?? 1);
    const limit = 20;

    // MODIFIED: Changed from unknown to any to support MongoDB operators like $or
    const query: Record<string, any> = {}; 
    if (status && status !== "all") query.status = status;

    // ADDED: Search Logic
    if (search) {
      // 1. Clean the search term to prevent regex crashes on special characters
      const cleanSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(cleanSearch, "i");

      // 2. Search users by Name, Student ID, or Email
      const userMatches = await User.find({
        $or: [
          { fullName: { $regex: searchRegex } },
          { studentId: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      })
      .select("_id")
      .lean();

      // Convert found User ObjectIds to standard strings
      const matchedUserIds = userMatches.map((u: any) => u._id.toString());

      // 3. Add to the main application query
      query.$or = [
        { transactionId: { $regex: searchRegex } },
        { userId: { $in: matchedUserIds } },
      ];
    }

    const [applications, total] = await Promise.all([
      MembershipApplication.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ submittedAt: -1 })
        .lean(),
      MembershipApplication.countDocuments(query),
    ]);

    // 1. Extract unique userIds (which are strings in your schema)
    const userIds = [...new Set(applications.map((a) => a.userId))];

    // 2. Fetch users. Mongoose is smart enough to auto-cast your string IDs 
    // to ObjectIds for the $in query under the hood.
    const users = await User.find({ _id: { $in: userIds } }).lean();

    // 3. Build the map using .reduce for cleaner TypeScript, 
    // explicitly converting the ObjectId _id to a string to match `userId`
    const userMap = users.reduce((map, user: any) => {
      map[user._id.toString()] = user;
      return map;
    }, {} as Record<string, any>); 

    // 4. Merge them together
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