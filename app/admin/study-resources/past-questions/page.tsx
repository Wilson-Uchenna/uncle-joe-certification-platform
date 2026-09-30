// app/admin/study-resources/past-questions/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PastQuestionResource from "@/models/PastQuestionResource";
import { PastQuestionsAdminTable } from "@/app/_components/admin/PastQuestionsAdminTable";
import mongoose from "mongoose";

export default async function PastQuestionsAdminPage() {
  await connectDB();
  // ...after await connectDB();
  const conn = mongoose.connection;
  const all = await PastQuestionResource.countDocuments({});
  const pub = await PastQuestionResource.countDocuments({ isPublished: true });
  const sample = await PastQuestionResource.findOne().select("isPublished").lean();
  console.log("DB:", conn.host, conn.name, "| collection:", PastQuestionResource.collection.name,
    "| total:", all, "| published:", pub, "| sample:", JSON.stringify(sample));
  

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