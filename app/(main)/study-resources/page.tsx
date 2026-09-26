// app/(main)/study-resources/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasResourceAccess } from "@/lib/resourceAccess";
import ExplanationResource from "@/models/ExplanationResources";
import Exam from "@/models/Exam";
import { StudyResourcesTabs } from "@/app/_components/StudyResourcesTabs";

export default async function StudyResourcesPage() {
  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Please log in to view study resources.</p>;
  }

  const explanations = await ExplanationResource.find({ isPublished: true })
    .select("title fileSize categoryName skillLevel")
    .sort({ categoryName: 1 })
    .lean();

  // Check access per explanation, not one global flag
  const explanationsWithAccess = await Promise.all(
    explanations.map(async (e) => ({
      ...e,
      _id: e._id.toString(),
      hasAccess: await hasResourceAccess(userId, "explanation", e._id.toString()),
    }))
  );

  const failedExams = await Exam.find({ userId, passed: false, status: "completed" })
    .select("categoryName skillLevel score correctCount totalQuestions completedAt")
    .sort({ completedAt: -1 })
    .lean();

  // Same per-item check for past-question reviews
  const failedExamsWithAccess = await Promise.all(
    failedExams.map(async (e) => ({
      ...e,
      _id: e._id.toString(),
      hasAccess: await hasResourceAccess(userId, "exam_review", e._id.toString()),
    }))
  );

  return (
    <StudyResourcesTabs
      explanations={JSON.parse(JSON.stringify(explanationsWithAccess))}
      failedExams={JSON.parse(JSON.stringify(failedExamsWithAccess))}
    />
  );
}