// app/(main)/study-resources/page.tsx
import connectDB from "@/lib/local-db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasResourceAccess } from "@/lib/resourceAccess";
import ExplanationResource from "@/models/ExplanationResources";
import PastQuestionResource from "@/models/PastQuestionResource";
import { StudyResourcesTabs } from "@/app/_components/StudyResourcesTabs";

export default async function StudyResourcesPage() {
  await connectDB();

  // TEMP DEBUG — remove after confirming
const debugCount = await PastQuestionResource.countDocuments({ isPublished: true });
console.log("PastQuestionResource published count:", debugCount);

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return <p>Please log in to view study resources.</p>;
  }

  const [explanations, pastQuestions] = await Promise.all([
    ExplanationResource.find({ isPublished: true })
      .select("title fileSize categoryName skillLevel")
      .sort({ categoryName: 1 })
      .lean(),
    PastQuestionResource.find({ isPublished: true })
      .select("title fileSize categoryName skillLevel")
      .sort({ categoryName: 1 })
      .lean(),
  ]);

  const explanationsWithAccess = await Promise.all(
    explanations.map(async (e) => ({
      ...e,
      _id: e._id.toString(),
      hasAccess: await hasResourceAccess(userId, "explanation", e._id.toString()),
    }))
  );

  const pastQuestionsWithAccess = await Promise.all(
    pastQuestions.map(async (p) => ({
      ...p,
      _id: p._id.toString(),
      hasAccess: await hasResourceAccess(userId, "past_question", p._id.toString()),
    }))
  );

  return (
    <StudyResourcesTabs
      explanations={JSON.parse(JSON.stringify(explanationsWithAccess))}
      pastQuestions={JSON.parse(JSON.stringify(pastQuestionsWithAccess))}
    />
  );
}