"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, ChevronDown, Save } from "lucide-react";

interface AppWithUser {
  _id: string;
  userId: string;
  membershipType: string;
  memberType?: string;
  hasIeeeAccount: boolean;
  ieeeAccountEmail?: string;
  chapters: { chapterId: string; chapterName: string; price: number }[];
  ieeeMembershipFee: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  statusMessage?: string; // ADDED: Public message field
  submittedAt: string;
  user?: {
    fullName: string;
    email: string;
    studentId: string;
    department: string;
    contactNumber: string;
    ieeeEmail?: string;
    idCardUrl?: string;
  };
}

const STATUS_OPTIONS = ["pending", "approved", "rejected"] as const;

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<AppWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AppWithUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("pending");
  const [editNotes, setEditNotes] = useState("");
  const [editStatusMessage, setEditStatusMessage] = useState(""); // ADDED: State for public message

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), status: statusFilter });
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      setApps(data.applications ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const openDetail = (app: AppWithUser) => {
    setSelected(app);
    setEditStatus(app.status);
    setEditNotes(app.adminNotes ?? "");
    setEditStatusMessage(app.statusMessage ?? ""); // ADDED: Populate public message
  };

  const saveChanges = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${selected._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // ADDED: Include statusMessage in payload
        body: JSON.stringify({ 
          status: editStatus, 
          adminNotes: editNotes,
          statusMessage: editStatusMessage 
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Application updated successfully");
      setSelected(null);
      fetchApps();
    } catch {
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{total}</span> applications
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Student", "Type", "Chapters", "Amount", "Payment", "Transaction ID", "Submitted", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : apps.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No applications found</td></tr>
              ) : (
                apps.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{app.user?.fullName ?? "—"}</p>
                      <p className="text-xs text-gray-400">{app.user?.studentId}</p>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-gray-700">{app.membershipType}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.chapters.map((c) => (
                          <span key={c.chapterId} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                            {c.chapterId.toUpperCase().replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(app.totalAmount)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{app.paymentMethod}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{app.transactionId}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(app.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={
                        app.status === "approved" ? "badge-approved" :
                        app.status === "rejected" ? "badge-rejected" :
                        "badge-pending"
                      }>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(app)}
                        className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-0.5"
                      >
                        Review <ChevronDown size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary text-xs disabled:opacity-40">Previous</button>
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="btn-secondary text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-900">Application Review</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Student Info */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Information</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Full Name", value: selected.user?.fullName ?? "—" },
                    { label: "Email", value: selected.user?.email ?? "—" },
                    { label: "Student ID", value: selected.user?.studentId ?? "—" },
                    { label: "Department", value: selected.user?.department ?? "—" },
                    { label: "Contact", value: selected.user?.contactNumber ?? "—" },
                    { label: "IEEE Email", value: selected.user?.ieeeEmail ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">{label}</p>
                      <p className="font-medium text-gray-800 break-all">{value}</p>
                    </div>
                  ))}
                </div>
                {selected.user?.idCardUrl && (
                  <a href={selected.user.idCardUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3 inline-flex items-center gap-2 text-xs">
                    View ID Card / Payslip
                  </a>
                )}
              </div>

              {/* Application Info */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Application Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Membership Type</p>
                    <p className="font-medium text-gray-800 capitalize">{selected.membershipType}</p>
                  </div>
                  {selected.memberType && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Member Type</p>
                      <p className="font-medium text-gray-800 capitalize">{selected.memberType.replace("_", " ")}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">IEEE Account Provided</p>
                    <p className="font-medium text-gray-800">{selected.hasIeeeAccount ? "Yes" : "No"}</p>
                  </div>
                  {selected.ieeeAccountEmail && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">IEEE Account Email</p>
                      <p className="font-medium text-gray-800 break-all">{selected.ieeeAccountEmail}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Payment Method</p>
                    <p className="font-medium text-gray-800 capitalize">{selected.paymentMethod}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                    <p className="font-medium text-gray-800 font-mono">{selected.transactionId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                    <p className="font-bold text-blue-700">{formatCurrency(selected.totalAmount)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Submitted</p>
                    <p className="font-medium text-gray-800">{formatDate(selected.submittedAt)}</p>
                  </div>
                </div>

                {/* Chapters */}
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Selected Chapters</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.chapters.map((c) => (
                      <div key={c.chapterId} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-blue-700">{c.chapterId.toUpperCase().replace("_", " ")}</span>
                        <span className="text-xs text-blue-500">{formatCurrency(c.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin Actions</p>

                <div>
                  <label className="label">Update Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="input"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* ADDED: Public Message Field */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span>Message to User</span>
                    <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Public</span>
                  </label>
                  <textarea
                    value={editStatusMessage}
                    onChange={(e) => setEditStatusMessage(e.target.value)}
                    className="input resize-none focus:border-blue-300 focus:ring-blue-100"
                    rows={2}
                    placeholder="e.g., Invalid transaction ID, please verify and contact support."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">This message will be visible to the student on their dashboard.</p>
                </div>

                {/* MODIFIED: Internal Notes Field */}
                <div>
                  <label className="label flex items-center justify-between">
                    <span>Internal Admin Notes</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Private</span>
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="input resize-none focus:border-gray-300 focus:ring-gray-100"
                    rows={2}
                    placeholder="Private notes for other admins..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">These notes are strictly internal and cannot be seen by the student.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={saveChanges} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}