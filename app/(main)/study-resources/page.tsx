// app/study-resources/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasStudyResourcesAccess } from "@/lib/studyResources";
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

  const hasPdfAccess = await hasStudyResourcesAccess(userId, "pdf_materials");
  const hasPastQuestionsAccess = await hasStudyResourcesAccess(userId, "past_questions");

  const explanations = await ExplanationResource.find({ isPublished: true })
    .select("title fileSize categoryName skillLevel")
    .sort({ categoryName: 1 })
    .lean();

  const failedExams = hasPastQuestionsAccess
    ? await Exam.find({ userId, passed: false, status: "completed" })
        .select("categoryName skillLevel score correctCount totalQuestions completedAt")
        .sort({ completedAt: -1 })
        .lean()
    : [];

  return (
    <StudyResourcesTabs
      hasPdfAccess={hasPdfAccess}
      hasPastQuestionsAccess={hasPastQuestionsAccess}
      explanations={JSON.parse(JSON.stringify(explanations))}
      failedExams={JSON.parse(JSON.stringify(failedExams))}
    />
  );
}