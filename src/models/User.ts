import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  fullName: string;
  ieeeEmail?: string;
  department: string;
  studentId: string;
  idCardUrl?: string;
  contactNumber: string;
  facebookId?: string;
  role: "student" | "admin";
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    fullName: { type: String, required: true },
    ieeeEmail: { type: String },
    department: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    idCardUrl: { type: String },
    contactNumber: { type: String, required: true },
    facebookId: { type: String },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
