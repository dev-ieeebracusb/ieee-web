import mongoose, { Schema, Document } from "mongoose";

export type MembershipType = "new" | "renew" | "extend";
export type PaymentMethod = "bkash" | "bank";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type MemberType = "new_member" | "existing_member";

export interface IChapterSelection {
  chapterId: string;
  chapterName: string;
  price: number;
}

export interface IMembershipApplication extends Document {
  userId: string;
  membershipType: MembershipType;
  memberType?: MemberType; // for extend
  hasIeeeAccount: boolean;
  ieeeAccountEmail?: string;
  ieeeAccountPassword?: string; // stored hashed or encrypted in production
  chapters: IChapterSelection[];
  ieeeMembershipFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: ApplicationStatus;
  adminNotes?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const ChapterSelectionSchema = new Schema<IChapterSelection>({
  chapterId: { type: String, required: true },
  chapterName: { type: String, required: true },
  price: { type: Number, required: true },
});

const MembershipApplicationSchema = new Schema<IMembershipApplication>(
  {
    userId: { type: String, required: true, index: true },
    membershipType: {
      type: String,
      enum: ["new", "renew", "extend"],
      required: true,
    },
    memberType: {
      type: String,
      enum: ["new_member", "existing_member"],
    },
    hasIeeeAccount: { type: Boolean, required: true },
    ieeeAccountEmail: { type: String },
    ieeeAccountPassword: { type: String }, // NOTE: encrypt this in production
    chapters: [ChapterSelectionSchema],
    ieeeMembershipFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["bkash", "bank"], required: true },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MembershipApplication =
  mongoose.models.MembershipApplication ??
  mongoose.model<IMembershipApplication>(
    "MembershipApplication",
    MembershipApplicationSchema
  );
