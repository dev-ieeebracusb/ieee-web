"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Member {
  _id: string;
  email: string;
  fullName: string;
  studentId: string;
  department: string;
  contactNumber: string;
  facebookId?: string;
  ieeeEmail?: string;
  idCardUrl?: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/members?${params}`);
      const data = await res.json();
      setMembers(data.members ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  return (
    <div className="space-y-4">
      {/* Search + count */}
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9"
              placeholder="Search by name, email, or student ID..."
            />
          </div>
          <p className="text-sm text-gray-500 shrink-0">
            <span className="font-semibold text-gray-800">{total}</span> members
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Student", "Student ID", "Department", "Contact", "IEEE Email", "Joined", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">No members found</td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                          {m.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{m.fullName}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{m.studentId}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[180px] truncate">{m.department}</td>
                    <td className="px-5 py-3 text-gray-600">{m.contactNumber}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{m.ieeeEmail ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(m.createdAt)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(m)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Member detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Member Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {selected.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.fullName}</p>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Student ID", value: selected.studentId },
                  { label: "Department", value: selected.department },
                  { label: "Contact", value: selected.contactNumber },
                  { label: "Facebook", value: selected.facebookId ?? "—" },
                  { label: "IEEE Email", value: selected.ieeeEmail ?? "—" },
                  { label: "Joined", value: formatDate(selected.createdAt) },
                  { label: "Role", value: selected.role },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-medium text-gray-800 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {selected.idCardUrl && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">ID Card / Payslip</p>
                  <a
                    href={selected.idCardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2 w-fit text-xs"
                  >
                    <User size={14} /> View Uploaded Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
