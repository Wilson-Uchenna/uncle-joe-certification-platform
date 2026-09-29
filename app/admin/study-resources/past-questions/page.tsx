// app/admin/study-resources/past-questions/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PastQuestionResource from "@/models/PastQuestionResource";
import { PastQuestionsAdminTable } from "@/app/_components/admin/PastQuestionsAdminTable";

export default async function PastQuestionsAdminPage() {
  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const resources = await PastQuestionResource.find()
    .select("title categoryName skillLevel fileSize isPublished createdAt")
    .sort({ categoryName: 1, skillLevel: 1 })
    .lean();

  return <PastQuestionsAdminTable resources={JSON.parse(JSON.stringify(resources))} />;
}