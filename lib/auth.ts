import { betterAuth, BetterAuthOptions } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin, emailOTP, customSession } from "better-auth/plugins";
import { ObjectId } from "mongodb";

const mongodb_uri = process.env.MONGODB_URI;

export interface ProfileInput {
  full_name: string;
  email: string;
  phone?: string;
  school?: string;
  state?: string;
  country?: string;
}

// Define auth options separately for type inference
const authOptions = {
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_URL}`,
  trustedOrigins: [
    "http://localhost:3000",
    "https://uncle-joe-certification-platform.vercel.app",
    "https://uncle-joe-certification-platform-*.vercel.app",
  ],
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
        input: true,
      },
      phone: { type: "string", input: true },

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
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      onboardingComplete: { type: "boolean", defaultValue: false },
      selectedCategoryId: { type: "string", defaultValue: null, input: true },
      selectedCategoryName: { type: "string", defaultValue: null, input: true },
      selectedCategorySlug: { type: "string", defaultValue: null, input: true },
      selectedRole: { type: "string", defaultValue: null, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
          if (!user.fullName && user.name) {
            user.fullName = user.name;
          }
          return { data: user };
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let endpoint;
        if (type === "sign-in") {
          endpoint = "signin";
        } else if (type === "email-verification") {
          endpoint = "verification";
        } else {
          endpoint = "reset-password";
        }

        const baseUrl = process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_URL}`;


        const res = await fetch(
          `${baseUrl}/api/email/send/${endpoint}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: email, otp }),
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to send OTP email: ${res.status}`);
        }
      },
      disableSignUp: false,
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...authOptions,
  plugins: [
    ...(authOptions.plugins ?? []),
    customSession(async ({ user, session }) => {
      // Fetch additional user data from DB
      const userDoc = await db
        .collection("user")
        .findOne(
          { _id: new ObjectId(user.id) },
          { projection: { role: 1, onboardingComplete: 1 } },
        );

      return {
        user: {
          ...user,
          role: (userDoc?.role as "user" | "admin") || "user",

          onboardingComplete: userDoc?.onboardingComplete as
            | boolean
            | undefined,
        },
        session,
      };
    }, authOptions),
    nextCookies(),
  ],
});
