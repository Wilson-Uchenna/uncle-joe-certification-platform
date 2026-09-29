// app/api/admin/study-resources/past-questions/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import connectDB from "@/lib/local-db";
import { Question } from "@/models/Questions";
import { Category } from "@/models/Category";
import PastQuestionResource from "@/models/PastQuestionResource";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

type SkillLevel = "entry" | "mid" | "advanced";

function buildQuestionsPdf(
  categoryName: string,
  skillLevel: SkillLevel,
  questions: { question: string; options: string[] }[],
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(18)
      .text(
        `${categoryName} — ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level`,
        {
          align: "center",
        },
      );
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Practice questions — no answer key included.", {
        align: "center",
      });
    doc.moveDown(2);
    doc.fillColor("#000");

    const letters = ["A", "B", "C", "D", "E"];

    questions.forEach((q, i) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${i + 1}. ${q.question}`);
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11);
      q.options.forEach((opt, idx) => {
        doc.text(`   ${letters[idx] ?? idx + 1}. ${opt}`);
      });
      doc.moveDown(1);

      // Avoid an awkward page break mid-question where possible
      if (doc.y > 700) doc.addPage();
    });

    doc.end();
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { categoryId, skillLevel, title, description } = await req.json();

    if (!categoryId || !skillLevel) {
      return NextResponse.json(
        { error: "categoryId and skillLevel are required" },
        { status: 400 },
      );
    }
    if (!["entry", "mid", "advanced"].includes(skillLevel)) {
      return NextResponse.json(
        { error: "Invalid skillLevel" },
        { status: 400 },
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Pull every active question for this category + skill level — same
    // source /api/exam/start draws from, but here we take ALL of them
    // (not a random sample), and deliberately drop correctAnswer.
    const questions = await Question.find({
      categoryId,
      skillLevel,
      isActive: true,
    })
      .select("question options")
      .lean();

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: `No questions found for "${category.name}" at ${skillLevel} level.`,
        },
        { status: 400 },
      );
    }

    const pdfBuffer = await buildQuestionsPdf(
      category.name,
      skillLevel,
      questions as any[],
    );

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            type: "authenticated",
            folder: "study-resources/past-questions",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(pdfBuffer);
    });

    const fileName = `${category.name.replace(/\s+/g, "-").toLowerCase()}-${skillLevel}-past-questions.pdf`;

    // Upsert — regenerating for the same category+skillLevel replaces the
    // old PDF rather than creating a duplicate resource/price entry
    const resource = await PastQuestionResource.findOneAndUpdate(
      { categoryId, skillLevel },
      {
        $set: {
          title: title || `${category.name} — ${skillLevel} past questions`,
          description:
            description ||
            `${questions.length} practice questions, no answer key.`,
          fileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalFileName: fileName,
          fileSize: uploadResult.bytes,
          categoryId,
          categoryName: category.name,
          skillLevel,
          createdBy: session.user.id,
        },
        $setOnInsert: { isPublished: false },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json(
      { id: resource._id, questionCount: questions.length },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Past-question PDF generation error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 },
    );
  }
}
