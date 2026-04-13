"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowLeft, Mail, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Reset link sent!");
        setIsSubmitted(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Form Section */}
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

        {!isSubmitted ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot password?</h1>
              <p className="text-gray-500 mt-2">
                No worries, we&apos;ll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleResetRequest} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email address</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    placeholder="you@g.bracu.ac.bd"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0">
              <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-8">
              We have sent a password reset link to <br className="hidden lg:block" />
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Didn&apos;t receive the email? Click to try again
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Visual Section (Hidden on small screens) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-blue-600">
        <img
          src="https://images.unsplash.com/photo-1454165833762-026524330663?auto=format&fit=crop&q=80&w=1500"
          alt="Security background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-center px-20 text-white">
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl w-fit mb-6">
            <KeyRound size={32} />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Keep your account <br /> secure and updated.
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed max-w-md">
            Your security is our priority. If you&apos;ve forgotten your password, 
            we use secure industry-standard encryption to help you recover access.
          </p>
          
          <div className="mt-12 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl max-w-sm">
            <p className="text-sm italic text-blue-50">
              &quot;The IEEE community has helped me stay on top of the latest tech trends and secure my professional profile.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-400 overflow-hidden">
                <img src="https://i.pravatar.cc/100?img=32" alt="Avatar" />
              </div>
              <span className="text-xs font-semibold">Sarah Jenkins, Student Member</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}