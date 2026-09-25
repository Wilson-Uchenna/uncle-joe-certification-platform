// app/admin/study-resources/explanations/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ExplanationResource from "@/models/ExplanationResources";
import { ExplanationsAdminTable } from "@/app/_components/admin/ExplanationsAdminTable";

export default async function ExplanationsAdminPage() {
  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const resources = await ExplanationResource.find()
    .select("title categoryName skillLevel fileSize isPublished createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return <ExplanationsAdminTable resources={JSON.parse(JSON.stringify(resources))} />;
}