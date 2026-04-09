export default function ProjectsPage() {
  return (
    <div className="card flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Projects</h2>
      <p className="text-sm text-gray-500">This section is coming soon.</p>
    </div>
  );
}
