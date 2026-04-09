"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2, Upload, X, CheckCircle2 } from "lucide-react";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdCardFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setIdCardPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setIdCardPreview(null);
    }

    // Upload immediately
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setIdCardUrl(url);
      toast.success("ID card uploaded successfully");
    } catch {
      toast.error("Failed to upload ID card. Please try again.");
      setIdCardFile(null);
      setIdCardPreview(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!idCardUrl) {
      toast.error("Please upload your BRACU ID card or Payslip");
      return;
    }

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

      if (result.error) {
        toast.error(result.error.message ?? "Registration failed");
      } else {
        toast.success("Account created successfully! Welcome to IEEE BRACU.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-gray-500 text-sm mb-6">Join IEEE BRACU Student Branch</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="label">Full Name *</label>
          <input {...register("fullName")} className="input" placeholder="John Doe" />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="label">BRACU Email Address *</label>
          <input {...register("email")} type="email" className="input" placeholder="you@g.bracu.ac.bd" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* IEEE Email */}
        <div>
          <label className="label">IEEE Account Email <span className="text-gray-400 font-normal">(optional)</span></label>
          <input {...register("ieeeEmail")} type="email" className="input" placeholder="your-ieee@ieee.org" />
          {errors.ieeeEmail && <p className="text-red-500 text-xs mt-1">{errors.ieeeEmail.message}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="input pr-9"
                placeholder="Min 8 chars"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm Password *</label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="input"
              placeholder="Repeat password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="label">Department *</label>
          <select {...register("department")} className="input">
            <option value="">Select your department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
        </div>

        {/* Student ID */}
        <div>
          <label className="label">BRACU Student ID *</label>
          <input {...register("studentId")} className="input" placeholder="e.g. 21301234" />
          {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId.message}</p>}
        </div>

        {/* ID Card Upload */}
        <div>
          <label className="label">
            BRACU ID Card / Payslip *{" "}
            <span className="text-gray-400 font-normal text-xs">(JPG, PNG, PDF — max 5MB)</span>
          </label>
          {idCardUrl ? (
            <div className="border-2 border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-3">
              {idCardPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={idCardPreview} alt="ID Card" className="w-12 h-12 object-cover rounded-lg" />
              ) : (
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">{idCardFile?.name}</p>
                <p className="text-xs text-green-600">Uploaded successfully</p>
              </div>
              <button
                type="button"
                onClick={() => { setIdCardFile(null); setIdCardPreview(null); setIdCardUrl(null); }}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-blue-50 transition-all">
              {uploadingFile ? (
                <Loader2 size={24} className="text-primary-500 animate-spin" />
              ) : (
                <Upload size={24} className="text-gray-400" />
              )}
              <span className="text-sm text-gray-500">
                {uploadingFile ? "Uploading..." : "Click to upload your ID card or Payslip"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingFile}
              />
            </label>
          )}
        </div>

        {/* Contact + Facebook */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Contact Number *</label>
            <input {...register("contactNumber")} className="input" placeholder="01XXXXXXXXX" />
            {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
          </div>
          <div>
            <label className="label">Facebook Profile URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input {...register("facebookId")} className="input" placeholder="facebook.com/you" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploadingFile}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
