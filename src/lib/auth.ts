import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(client.db("ieee-web")),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: false,
   sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("@/lib/mailer");
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <p>Hi ${user.name},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: false,
      },
      fullName: {
        type: "string",
        required: true,
      },
      ieeeEmail: {
        type: "string",
        required: false,
      },
      department: {
        type: "string",
        required: true,
      },
      studentId: {
        type: "string",
        required: true,
      },
      idCardUrl: {
        type: "string",
        required: false,
      },
      contactNumber: {
        type: "string",
        required: true,
      },
      facebookId: {
        type: "string",
        required: false,
      },
      isApproved: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("@/lib/mailer");
      await sendEmail({
        to: user.email,
        subject: "Verify your IEEE BRACU account",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #2563eb;">Welcome to IEEE BRACU!</h2>
            <p>Hi ${user.name}, please verify your email address:</p>
            <a href="${url}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">
              Verify Email
            </a>
            <p style="color:#666;font-size:13px;">If you didn't create an account, ignore this email.</p>
          </div>
        `,
      });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh if 1 day old
  },
});

export type Session = typeof auth.$Infer.Session;
