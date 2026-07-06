import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { emailOTP } from "better-auth/plugins";

const mongodb_uri = process.env.MONGODB_URI;

export interface ProfileInput {
  full_name: string;
  email: string;
  phone?: string;
  school?: string;
  state?: string;
  country?: string;
  // Collected later in the flow, not at registration.
  skill_level?: "entry" | "mid" | "advanced";
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    
  },
  user: {
    additionalFields: {
      fullName: {
        type: "string",
        required: false,
        input: true, // Allow during registration
      },
      phone: { type: "string", input: true },
      skillLevel: {
        type: "string",
        required: false,
        input: true,
      },
      employer: { type: "string" },
      state: {
        type: "string",
        required: false,
        input: true,
      },
      country: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
      onboardingComplete: { type: "boolean", defaultValue: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.fullName && user.name) {
            user.fullName = user.name;
          }
          // Also copy other fields if passed
          return { data: user };
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          await fetch(`${process.env.BETTER_AUTH_URL}/api/email/send`, {
            method: "POST",
            body: JSON.stringify({
              to: email,
              otp,
              
            }),
          });
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
      disableSignUp: true, // Allow sign up with OTP
    }),
    nextCookies(),
  ],
});
