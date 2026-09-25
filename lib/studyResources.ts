// lib/studyResources.ts
import connectDB from "@/lib/local-db";
import StudyResourcesAccess from "@/models/StudyResourcesAccess";

type AccessType = "pdf_materials" | "past_questions";

export async function hasStudyResourcesAccess(userId: string, type: AccessType): Promise<boolean> {
  await connectDB();
  const access = await StudyResourcesAccess.findOne({ user: userId, type }).lean();
  return !!access;
}

export async function grantStudyResourcesAccess({
  userId,
  type,
  paymentReference,
}: {
  userId: string;
  type: AccessType;
  paymentReference: string;
}) {
  await connectDB();
  return StudyResourcesAccess.findOneAndUpdate(
    { user: userId, type },
    { user: userId, type, paymentReference, grantedAt: new Date() },
    { upsert: true, new: true }
  );
}