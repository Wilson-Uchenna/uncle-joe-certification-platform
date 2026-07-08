import "better-auth";

declare module "better-auth" {
  interface User {
    role: "user" | "admin";
    fullName?: string;
    phone?: string;
    skillLevel?: "entry" | "mid" | "advanced";
    employer?: string;
    state?: string;
    country?: string;
    onboardingComplete?: boolean;
    selectedCategoryId?: string | null;
    selectedCategoryName?: string | null;
    selectedCategorySlug?: string | null;
    selectedRole?: string | null;
  }
}