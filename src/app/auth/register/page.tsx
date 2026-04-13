"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2, Upload, X, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";
import { DEPARTMENTS } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  ieeeEmail: z.string().email("Invalid IEEE email").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  department: z.string().min(1, "Please select your department"),
  studentId: z.string().min(5, "Enter a valid student ID"),
  contactNumber: z.string().min(10, "Enter a valid contact number"),
  facebookId: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ 
    resolver: zodResolver(schema) 
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdCardFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setIdCardPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else { setIdCardPreview(null); }

    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setIdCardUrl(url);
      toast.success("ID card uploaded");
    } catch {
      toast.error("Upload failed");
      setIdCardFile(null);
    } finally { setUploadingFile(false); }
  };

  const onSubmit = async (data: FormData) => {
    if (!idCardUrl) return toast.error("Please upload your ID card");
    setLoading(true);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.fullName,
        // @ts-expect-error - better-auth additional fields
        fullName: data.fullName,
        ieeeEmail: data.ieeeEmail ?? "",
        department: data.department,
        studentId: data.studentId,
        idCardUrl: idCardUrl,
        contactNumber: data.contactNumber,
        facebookId: data.facebookId ?? "",
      });

      if (result.error) toast.error(result.error.message);
      else {
        toast.success("Welcome to IEEE BRACU!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-white">
            {/* Left Column: Branding (Sticky) */}

      <div className="hidden lg:block lg:w-2/5 xl:w-1/2 relative bg-blue-600">
        <img src="https://images.unsplash.com/photo-1523240715639-93f8fd0a9840?auto=format&fit=crop&q=80&w=1500" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-transparent" />
        <div className="relative h-full flex flex-col justify-center px-16 text-white">
          <ShieldCheck size={48} className="mb-6 opacity-80" />
          <h2 className="text-4xl font-bold leading-tight mb-4">Empowering <br /> Future Engineers.</h2>
          <p className="text-blue-100 text-lg max-w-md">By joining IEEE BRACU, you gain access to a network of professionals, technical resources, and hands-on workshops that bridge the gap between academia and industry.</p>
        </div>
      </div>
      {/* Right Column: Form (Scrollable) */}
      <div className="flex flex-col w-full lg:w-3/5 xl:w-1/2 overflow-y-auto">
        <div className="max-w-[600px] mx-auto w-full px-8 py-12 md:px-16">
          
          <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-gray-500 mt-2 text-sm">Join the world&apos;s largest technical professional organization.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                <input {...register("fullName")} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="John Doe" />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Emails */}
              <div>
                <label className="text-sm font-semibold text-gray-700">BRACU Email *</label>
                <input {...register("email")} type="email" className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="you@g.bracu.ac.bd" />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">IEEE Email (Optional)</label>
                <input {...register("ieeeEmail")} type="email" className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="name@ieee.org" />
              </div>

              {/* Passwords */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Password *</label>
                <div className="relative mt-2">
                  <input {...register("password")} type={showPassword ? "text" : "password"} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Confirm Password *</label>
                <input {...register("confirmPassword")} type="password" className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="••••••••" />
              </div>

              {/* Academic */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Department *</label>
                <select {...register("department")} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white">
                  <option value="">Select Dept</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Student ID *</label>
                <input {...register("studentId")} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="2130XXXX" />
              </div>
            </div>

            {/* ID Card Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700">BRACU ID Card / Payslip *</label>
              <div className="mt-2">
                {idCardUrl ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700 truncate max-w-[200px]">{idCardFile?.name}</span>
                    </div>
                    <button type="button" onClick={() => setIdCardUrl(null)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                    {uploadingFile ? <Loader2 className="animate-spin text-blue-600" /> : <Upload className="text-gray-400 mb-2" />}
                    <span className="text-xs text-gray-500">{uploadingFile ? "Uploading..." : "Upload JPG or PDF"}</span>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} disabled={uploadingFile} />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Contact Number *</label>
                <input {...register("contactNumber")} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="017XXXXXXXX" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Facebook URL</label>
                <input {...register("facebookId")} className="w-full mt-2 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="facebook.com/..." />
              </div>
            </div>

            <button type="submit" disabled={loading || uploadingFile} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
              {(loading || uploadingFile) && <Loader2 size={18} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500 pb-10">
            Already registered? <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      
    </div>
  );
}