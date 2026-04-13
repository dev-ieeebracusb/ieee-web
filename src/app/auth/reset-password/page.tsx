"use client";

import { useState, useEffect, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, KeyRound, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

// 1. Separate the form into a child component to use searchParams safely
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fix Hydration: Ensure component is mounted before checking token
  useEffect(() => {
    setMounted(true);
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Invalid or expired token.");

    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password.");
      } else {
        toast.success("Password updated successfully!");
        router.push("/auth/login");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent UI flash during hydration
  if (!mounted) return null;

  // Error View if token is missing
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
        <p className="text-gray-500 mb-8 max-w-xs">This password reset link is invalid, expired, or has already been used.</p>
        <Link href="/auth/forgot-password" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all block text-center">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set new password</h1>
        <p className="text-gray-500 mt-2">
          Choose a strong password to protect your IEEE account.
        </p>
      </div>

      <form onSubmit={handleNewPassword} className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-gray-700">New Password</label>
          <div className="relative mt-2">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              placeholder="••••••••"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Reset Password
        </button>
      </form>
    </>
  );
}

// 2. Main Page with Suspense and Layout
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-white">
        {/* Left Column: Visual Section */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1633265485768-3066373f1721?auto=format&fit=crop&q=80&w=1500"
          alt="Security"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl w-fit mb-6">
            <KeyRound size={32} />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Secure your future <br /> with IEEE.
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed max-w-md">
            Choose a strong, unique password to ensure your IEEE member profile and data remain protected at all times.
          </p>
        </div>
      </div>
      {/* Right Column: Form Section */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 md:px-24 lg:px-32 bg-white">
        
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-12 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to login
        </Link>

        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            I
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">IEEE BRACU</span>
        </div>

        {/* Suspense is REQUIRED when using useSearchParams in Next.js App Router */}
        <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      
    </div>
  );
}