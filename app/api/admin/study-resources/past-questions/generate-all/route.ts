// app/api/admin/study-resources/past-questions/generate-all/route.ts
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
const SKILL_LEVELS: SkillLevel[] = ["entry", "mid", "advanced"];

interface QuestionForPdf {
  question: string;
  options: string[];
  codeSnippet?: string;
  language?: string;
}

function buildQuestionsPdf(
  categoryName: string,
  skillLevel: SkillLevel,
  questions: QuestionForPdf[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(18)
      .text(`${categoryName} — ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level`, {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#666")
      .text("Practice questions — no answer key included.", { align: "center" });
    doc.moveDown(2);
    doc.fillColor("#000");

    const letters = ["A", "B", "C", "D", "E"];

    questions.forEach((q, i) => {
      doc.fontSize(12).font("Helvetica-Bold").text(`${i + 1}. ${q.question}`);
      doc.moveDown(0.3);

      if (q.codeSnippet) {
        doc.font("Courier").fontSize(9).fillColor("#333");
        doc.text(q.codeSnippet, { indent: 10 });
        doc.fillColor("#000");
        doc.moveDown(0.3);
      }

      doc.font("Helvetica").fontSize(11);
      q.options.forEach((opt, idx) => {
        doc.text(`   ${letters[idx] ?? idx + 1}. ${opt}`);
      });
      doc.moveDown(1);

      if (doc.y > 700) doc.addPage();
    });

    doc.end();
  });
}

async function uploadPdf(buffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
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
        }
      )
      .end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const categories = await Category.find().lean();

    const results: {
      categoryName: string;
      skillLevel: SkillLevel;
      status: "generated" | "skipped_no_questions" | "failed";
      questionCount?: number;
      error?: string;
    }[] = [];

    for (const category of categories) {
      for (const skillLevel of SKILL_LEVELS) {
        try {
          const questions = await Question.find({
            categoryId: category._id,
            skillLevel,
            isActive: true,
          })
            .select("question options codeSnippet language")
            .lean();

          if (questions.length === 0) {
            results.push({ categoryName: category.name, skillLevel, status: "skipped_no_questions" });
            continue;
          }

          const pdfBuffer = await buildQuestionsPdf(category.name, skillLevel, questions as any[]);
          const uploadResult = await uploadPdf(pdfBuffer);

          const fileName = `${category.name.replace(/\s+/g, "-").toLowerCase()}-${skillLevel}-past-questions.pdf`;

          await PastQuestionResource.findOneAndUpdate(
            { categoryId: category._id, skillLevel },
            {
              $set: {
                title: `${category.name} — ${skillLevel} past questions`,
                description: `${questions.length} practice questions, no answer key.`,
                fileUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                originalFileName: fileName,
                fileSize: uploadResult.bytes,
                categoryId: category._id,
                categoryName: category.name,
                skillLevel,
                createdBy: session.user.id,
              },
              $setOnInsert: { isPublished: false },
            },
            { upsert: true, new: true }
          );

          results.push({
            categoryName: category.name,
            skillLevel,
            status: "generated",
            questionCount: questions.length,
          });
        } catch (err: any) {
          results.push({
            categoryName: category.name,
            skillLevel,
            status: "failed",
            error: err.message || "Unknown error",
          });
        }
      }
    }

    const generated = results.filter((r) => r.status === "generated").length;
    const skipped = results.filter((r) => r.status === "skipped_no_questions").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      summary: { generated, skipped, failed, total: results.length },
      results,
    });
  } catch (error: any) {
    console.error("Bulk past-question generation error:", error);
    return NextResponse.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}