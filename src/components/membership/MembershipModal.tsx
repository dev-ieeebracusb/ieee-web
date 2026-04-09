"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, Loader2, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import config from "@/lib/membership-config.json";
import type { Chapter } from "@/types";

interface MembershipModalProps {
  action: "new" | "renew" | "extend";
  onClose: () => void;
  onSuccess: () => void;
}

const schema = z.object({
  hasIeeeAccount: z.enum(["yes", "no"]),
  ieeeAccountEmail: z.string().email().optional().or(z.literal("")),
  ieeeAccountPassword: z.string().optional(),
  memberType: z.enum(["new_member", "existing_member"]).optional(),
  paymentMethod: z.enum(["bkash", "bank"]),
  transactionId: z.string().min(3, "Transaction ID is required"),
});
type FormData = z.infer<typeof schema>;

const actionLabels = {
  new: "Buy New Membership",
  renew: "Renew Membership",
  extend: "Extend Chapters Membership",
};

export default function MembershipModal({ action, onClose, onSuccess }: MembershipModalProps) {
  const [selectedChapters, setSelectedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { hasIeeeAccount: "no", paymentMethod: "bkash" },
  });

  const hasIeeeAccount = watch("hasIeeeAccount");
  const paymentMethod = watch("paymentMethod");
  const memberType = watch("memberType");

  const toggleChapter = (id: string) => {
    setSelectedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { chapterTotal, ieeeFee, total } = useMemo(() => {
    const priceKey = action === "extend" ? "extend" : action === "renew" ? "renew" : "new";
    const chapterTotal = Array.from(selectedChapters).reduce((sum, id) => {
      const ch = config.chapters.find((c) => c.id === id);
      return sum + (ch ? ch.prices[priceKey] : 0);
    }, 0);

    let ieeeFee = 0;
    if (action === "new" && hasIeeeAccount === "no") {
      ieeeFee = config.ieeeMembershipFee.new;
    } else if (action === "renew") {
      ieeeFee = config.ieeeMembershipFee.renew;
    }

    return { chapterTotal, ieeeFee, total: chapterTotal + ieeeFee };
  }, [selectedChapters, action, hasIeeeAccount]);

  const onSubmit = async (data: FormData) => {
    if (selectedChapters.size === 0) {
      toast.error("Please select at least one chapter");
      return;
    }

    const priceKey = action === "extend" ? "extend" : action === "renew" ? "renew" : "new";
    const chapters = Array.from(selectedChapters).map((id) => {
      const ch = config.chapters.find((c) => c.id === id)!;
      return { chapterId: ch.id, chapterName: ch.name, price: ch.prices[priceKey] };
    });

    setLoading(true);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipType: action,
          memberType: data.memberType,
          hasIeeeAccount: data.hasIeeeAccount === "yes",
          ieeeAccountEmail: data.ieeeAccountEmail,
          ieeeAccountPassword: data.ieeeAccountPassword,
          chapters,
          ieeeMembershipFee: ieeeFee,
          totalAmount: total,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      toast.success("Application submitted successfully!");
      onSuccess();
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chapters = config.chapters as Chapter[];
  const payment = config.payment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-gray-900">{actionLabels[action]}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* IEEE Account question (new & renew) */}
          {(action === "new" || action === "renew") && (
            <div>
              <label className="label">Do you have an IEEE account?</label>
              <div className="flex gap-3">
                {["yes", "no"].map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...register("hasIeeeAccount")}
                      type="radio"
                      value={v}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {v === "yes" ? "Yes, I have an IEEE account" : "No, I don't have one"}
                    </span>
                  </label>
                ))}
              </div>

              {hasIeeeAccount === "yes" && (
                <div className="mt-3 grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <label className="label">IEEE Account Email</label>
                    <input {...register("ieeeAccountEmail")} type="email" className="input" placeholder="your@ieee.org" />
                    {errors.ieeeAccountEmail && <p className="text-red-500 text-xs mt-1">{errors.ieeeAccountEmail.message}</p>}
                  </div>
                  <div>
                    <label className="label">IEEE Account Password</label>
                    <input {...register("ieeeAccountPassword")} type="password" className="input" placeholder="••••••••" />
                  </div>
                  <p className="col-span-2 text-xs text-blue-600">
                    Your credentials are stored securely and only used to process your membership.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Member type (extend only) */}
          {action === "extend" && (
            <div>
              <label className="label">Member Type</label>
              <div className="flex gap-3">
                {[
                  { value: "new_member", label: "New Member" },
                  { value: "existing_member", label: "Existing Member" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...register("memberType")}
                      type="radio"
                      value={opt.value}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Chapter selection */}
          <div>
            <label className="label">Select Chapter(s)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {chapters.map((ch) => {
                const priceKey = action === "extend" ? "extend" : action === "renew" ? "renew" : "new";
                const selected = selectedChapters.has(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChapter(ch.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: ch.color + "20", color: ch.color }}
                    >
                      {ch.shortName}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-2">{ch.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(ch.prices[priceKey])}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price breakdown */}
          {(selectedChapters.size > 0 || ieeeFee > 0) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-700 mb-1">Price Breakdown</p>
              {ieeeFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>IEEE Membership Fee</span>
                  <span>{formatCurrency(ieeeFee)}</span>
                </div>
              )}
              {Array.from(selectedChapters).map((id) => {
                const ch = chapters.find((c) => c.id === id)!;
                const priceKey = action === "extend" ? "extend" : action === "renew" ? "renew" : "new";
                return (
                  <div key={id} className="flex justify-between text-gray-600">
                    <span>{ch.name}</span>
                    <span>{formatCurrency(ch.prices[priceKey])}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div>
            <label className="label">Payment Method</label>
            <div className="flex gap-3 mb-4">
              {["bkash", "bank"].map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("paymentMethod")}
                    type="radio"
                    value={method}
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{method === "bkash" ? "bKash" : "Bank Transfer"}</span>
                </label>
              ))}
            </div>

            {paymentMethod === "bkash" && (
              <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 text-sm space-y-1.5">
                <p className="font-semibold text-pink-800">Send to bKash Number</p>
                <p className="text-pink-700">Number: <span className="font-bold">{payment.bkash.number}</span> ({payment.bkash.type})</p>
                <p className="text-pink-700">Amount: <span className="font-bold">{formatCurrency(total)}</span></p>
                <p className="text-pink-700">Reference: <span className="font-bold">{payment.bkash.reference}</span></p>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm space-y-1.5">
                <p className="font-semibold text-indigo-800">Bank Transfer Details</p>
                <p className="text-indigo-700">Bank: <span className="font-bold">{payment.bank.bankName}</span></p>
                <p className="text-indigo-700">Account Name: <span className="font-bold">{payment.bank.accountName}</span></p>
                <p className="text-indigo-700">Account Number: <span className="font-bold">{payment.bank.accountNumber}</span></p>
                <p className="text-indigo-700">Branch: <span className="font-bold">{payment.bank.branchName}</span></p>
                <p className="text-indigo-700">Amount: <span className="font-bold">{formatCurrency(total)}</span></p>
              </div>
            )}

            {/* Transaction ID */}
            <div className="mt-4">
              <label className="label">Transaction ID *</label>
              <input
                {...register("transactionId")}
                className="input"
                placeholder="Enter your transaction/reference ID"
              />
              {errors.transactionId && <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
