export interface UserProfile {
  id: string;
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
  createdAt: string;
}

export interface Chapter {
  id: string;
  name: string;
  shortName: string;
  color: string;
  description: string;
  prices: {
    new: number;
    renew: number;
    extend: number;
  };
}

export interface MembershipConfig {
  chapters: Chapter[];
  ieeeMembershipFee: {
    new: number;
    renew: number;
  };
  payment: {
    bkash: {
      number: string;
      type: string;
      reference: string;
    };
    bank: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      branchName: string;
      routingNumber: string;
    };
  };
}

export interface ApplicationSubmission {
  id: string;
  userId: string;
  membershipType: "new" | "renew" | "extend";
  memberType?: "new_member" | "existing_member";
  hasIeeeAccount: boolean;
  ieeeAccountEmail?: string;
  chapters: { chapterId: string; chapterName: string; price: number }[];
  ieeeMembershipFee: number;
  totalAmount: number;
  paymentMethod: "bkash" | "bank";
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  submittedAt: string;
  user?: UserProfile;
}
