// lib/resourceAccess.ts — replaces lib/studyResources.ts
import connectDB from "@/lib/local-db";
import ResourcePurchase from "@/models/ResourcePurchase";

export async function hasResourceAccess(
  userId: string,
  resourceType: "explanation" | "exam_review",
  resourceId: string
): Promise<boolean> {
  await connectDB();
  const purchase = await ResourcePurchase.findOne({ user: userId, resourceType, resourceId }).lean();
  return !!purchase;
}

export async function grantResourceAccess({
  userId,
  resourceType,
  resourceId,
  paymentReference,
}: {
  userId: string;
  resourceType: "explanation" | "exam_review";
  resourceId: string;
  paymentReference: string;
}) {
  await connectDB();
  return ResourcePurchase.findOneAndUpdate(
    { user: userId, resourceType, resourceId },
    { user: userId, resourceType, resourceId, paymentReference, grantedAt: new Date() },
    { upsert: true, new: true }
  );
}