"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ApplicationSubmission } from "@/types";
import { Plus, RefreshCw, ChevronRight, CreditCard } from "lucide-react";
import MembershipModal from "@/components/membership/MembershipModal";
import config from "@/lib/membership-config.json";

type ModalAction = "new" | "renew" | "extend" | null;

export default function MembershipPage() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<ApplicationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/membership");
      const data = await res.json();
      setApplications(data.applications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle ?action= query param from dashboard links
  useEffect(() => {
    const action = searchParams.get("action") as ModalAction;
    if (action) setModalAction(action);
  }, [searchParams]);

  const approvedChapterIds = new Set(
    applications
      .filter((a) => a.status === "approved")
      .flatMap((a) => a.chapters.map((c) => c.chapterId))
  );

  return (
    <div className="space-y-6">
      {/* Current Memberships */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">My Memberships</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your current IEEE chapter memberships</p>
          </div>
          <button
            onClick={() => setModalAction("new")}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            <Plus size={14} />
            Buy / Extend Membership
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {config.chapters.map((chapter) => {
            const isActive = approvedChapterIds.has(chapter.id);
            return (
              <div
                key={chapter.id}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: chapter.color + "20", color: chapter.color }}
                  >
                    {chapter.shortName}
                  </span>
                  {isActive && (
                    <span className="badge-approved">Active</span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800">{chapter.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{chapter.description}</p>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
          {(["new", "renew", "extend"] as const).map((action) => (
            <button
              key={action}
              onClick={() => setModalAction(action)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
            >
              {action === "new" && <Plus size={14} className="text-blue-500" />}
              {action === "renew" && <RefreshCw size={14} className="text-green-500" />}
              {action === "extend" && <ChevronRight size={14} className="text-purple-500" />}
              {action === "new" ? "Buy New Membership" : action === "renew" ? "Renew Membership" : "Extend Chapters"}
            </button>
          ))}
        </div>
      </div>

      {/* Applications History */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Application History</h2>

        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="py-10 text-center">
            <CreditCard size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No applications submitted yet</p>
            <button onClick={() => setModalAction("new")} className="btn-primary mt-4 text-xs">
              Apply Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Chapters</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Payment</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800 capitalize">{app.membershipType}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.chapters.map((c) => (
                          <span key={c.chapterId} className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {c.chapterId.toUpperCase().replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-gray-900">{formatCurrency(app.totalAmount)}</td>
                    <td className="py-3 capitalize text-gray-600">{app.paymentMethod}</td>
                    <td className="py-3 text-gray-500">{formatDate(app.submittedAt)}</td>
                    <td className="py-3">
                      <span className={
                        app.status === "approved" ? "badge-approved" :
                        app.status === "rejected" ? "badge-rejected" :
                        "badge-pending"
                      }>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Membership Application Modal */}
      {modalAction && (
        <MembershipModal
          action={modalAction}
          onClose={() => setModalAction(null)}
          onSuccess={() => {
            setModalAction(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
