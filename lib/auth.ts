import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const mongodb_uri = process.env.MONGODB_URI;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Use Resend to send verification email
      await fetch(`${process.env.APP_URL}/api/email/send`, {
        method: "POST",
        body: JSON.stringify({
          to: user.email,
          subject: "Verify your email",
          template: "verification",
          url,
        }),
      });
    },
  },
  user: {
    additionalFields: {
      fullName: {
        type: "string",
        required: true,
        input: true, // Allow during registration
      },
      phone: { type: "string" },
      skillLevel: {
        type: "string",
        required: true,
        input: true,
      },
      employer: { type: "string" },
      state: {
        type: "string",
        required: true,
        input: true,
      },
      country: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },
  plugins: [nextCookies()],
});
