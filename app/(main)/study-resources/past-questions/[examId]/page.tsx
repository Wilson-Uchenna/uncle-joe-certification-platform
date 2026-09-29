// app/(main)/study-resources/past-questions/[examId]/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasResourceAccess } from "@/lib/resourceAccess";
import Exam from "@/models/Exam";
import { PastQuestionReview } from "@/app/_components/PastQuestions";

export default async function PastQuestionDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  await connectDB();

  const { examId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return <p>Please log in.</p>;

  const hasAccess = await hasResourceAccess(session.user.id, "past_question", examId);
  if (!hasAccess) return <p>🔒 Pay to unlock this review.</p>;

  const exam = await Exam.findOne({ _id: examId, userId: session.user.id, passed: false })
    .select("categoryName skillLevel score correctCount totalQuestions questions")
    .lean();

  if (!exam) return <p>Not found or you don't have access.</p>;

  return <PastQuestionReview exam={JSON.parse(JSON.stringify(exam))} />;
}