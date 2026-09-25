// app/study-resources/past-questions/[examId]/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasStudyResourcesAccess } from "@/lib/studyResources";
import Exam from "@/models/Exam";
import { PastQuestionReview } from "@/app/_components/PastQuestions";

export default async function PastQuestionDetailPage({
  params,
}: {
  params: { examId: string };
}) {
  await connectDB();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return <p>Please log in.</p>;

  const hasAccess = await hasStudyResourcesAccess(session.user.id, "past_questions");
  if (!hasAccess) return <p>🔒 Unlock access to view this.</p>;

  const exam = await Exam.findOne({ _id: params.examId, userId: session.user.id, passed: false })
    .select("categoryName skillLevel score correctCount totalQuestions questions")
    .lean();

  if (!exam) return <p>Not found or you don't have access.</p>;

  return <PastQuestionReview exam={JSON.parse(JSON.stringify(exam))} />;
}