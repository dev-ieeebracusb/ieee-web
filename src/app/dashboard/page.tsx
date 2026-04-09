import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { MembershipApplication } from "@/models/MembershipApplication";
import Link from "next/link";
import { TrendingUp, CreditCard, ArrowRight, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getUserApplications(userId: string) {
  await connectDB();
  return MembershipApplication.find({ userId }).sort({ submittedAt: -1 }).limit(5).lean();
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const applications = session ? await getUserApplications(session.user.id) : [];

  const approved = applications.filter((a) => a.status === "approved").length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const totalPaid = applications
    .filter((a) => a.status === "approved")
    .reduce((sum, a) => sum + a.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Approved Applications</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{approved}</p>
            <Link href="/dashboard/membership" className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">
              See More
            </Link>
          </div>
        </div>

        <div className="card flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Applications</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{pending}</p>
            <Link href="/dashboard/membership" className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">
              See More
            </Link>
          </div>
        </div>

        <div className="card flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CreditCard size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalPaid)}</p>
            <Link href="/dashboard/membership" className="text-xs text-blue-600 font-medium hover:underline mt-1 inline-block">
              See More
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Submissions */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link
              href="/dashboard/membership"
              className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              + Apply for Membership
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">No applications yet</p>
              <Link href="/dashboard/membership" className="btn-primary inline-block mt-4 text-xs">
                Apply for Membership
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app._id.toString()} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {app.membershipType} Membership
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(app.submittedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(app.totalAmount)}</p>
                    <span className={
                      app.status === "approved" ? "badge-approved" :
                      app.status === "rejected" ? "badge-rejected" :
                      "badge-pending"
                    }>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {applications.length > 0 && (
            <Link href="/dashboard/membership" className="mt-3 text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
              See All <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link
              href="/dashboard/membership?action=new"
              className="block w-full text-left px-4 py-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <p className="text-sm font-semibold text-blue-800">Buy New Membership</p>
              <p className="text-xs text-blue-500 mt-0.5">Join IEEE & choose chapters</p>
            </Link>
            <Link
              href="/dashboard/membership?action=renew"
              className="block w-full text-left px-4 py-3 rounded-xl border border-green-100 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <p className="text-sm font-semibold text-green-800">Renew Membership</p>
              <p className="text-xs text-green-500 mt-0.5">Renew your current membership</p>
            </Link>
            <Link
              href="/dashboard/membership?action=extend"
              className="block w-full text-left px-4 py-3 rounded-xl border border-purple-100 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <p className="text-sm font-semibold text-purple-800">Extend Chapters</p>
              <p className="text-xs text-purple-500 mt-0.5">Add more chapters to your membership</p>
            </Link>
          </div>

          {/* Chapters info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Available Chapters</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "CS", color: "bg-blue-100 text-blue-700" },
                { name: "RAS", color: "bg-green-100 text-green-700" },
                { name: "EDS", color: "bg-purple-100 text-purple-700" },
              ].map((ch) => (
                <span key={ch.name} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ch.color}`}>
                  {ch.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
