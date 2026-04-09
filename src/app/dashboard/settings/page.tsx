import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as Record<string, string> | undefined;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card">
        <h2 className="font-bold text-gray-900 mb-4">Profile Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Full Name", value: user?.fullName ?? user?.name ?? "—" },
            { label: "Email", value: user?.email ?? "—" },
            { label: "IEEE Email", value: user?.ieeeEmail ?? "—" },
            { label: "Student ID", value: user?.studentId ?? "—" },
            { label: "Department", value: user?.department ?? "—" },
            { label: "Contact Number", value: user?.contactNumber ?? "—" },
            { label: "Facebook", value: user?.facebookId ?? "—" },
            { label: "Role", value: user?.role ?? "student" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="font-medium text-gray-800 break-all">{value}</p>
            </div>
          ))}
        </div>
        {user?.idCardUrl && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">ID Card / Payslip</p>
            <a
              href={user.idCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 text-xs"
            >
              View Uploaded Document
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="font-bold text-gray-900 mb-2">Account</h2>
        <p className="text-sm text-gray-500 mb-4">
          To update your profile information or change your password, please contact the IEEE BRACU admin.
        </p>
        <a
          href="mailto:ieee@bracu.ac.bd"
          className="btn-primary inline-block text-xs"
        >
          Contact Admin
        </a>
      </div>
    </div>
  );
}
