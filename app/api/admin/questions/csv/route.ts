import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Question } from "@/models/Questions";
import mongoose from "mongoose";
import Papa from "papaparse";

function parseCSV(text: string): Record<string, string>[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transform: (value: string) => value.trim(),
  });
  return result.data as Record<string, string>[];
}

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;

    if (!file || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Required information is missing. Complete all mandatory fields before proceeding." },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    const questions = rows
      .map((row) => {
        const options = [row.option1, row.option2, row.option3, row.option4]
          .filter(Boolean)
          .map((o) => o.trim());

        if (options.length < 2) return null;

        const correctAnswer = parseInt(row.correctAnswer);
        if (isNaN(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
          return null;
        }

        // Validate skillLevel
        const skillLevel = row.skillLevel?.trim().toLowerCase();
        if (!skillLevel || !["entry", "mid", "advanced"].includes(skillLevel)) {
          return null;
        }

        return {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          question: row.question?.trim(),
          options,
          correctAnswer,
          explanation: row.explanation?.trim() || "",
          skillLevel, // ← FIXED: was `difficulty`
          isFinalStage: row.isFinalStage?.toLowerCase() === "true",
          role: row.role?.trim() || null,
          codeSnippet: row.codeSnippet?.trim() || undefined,
          language: row.language?.trim() || undefined,
          isActive: true,
          timesUsed: 0,
          timesCorrect: 0,
        };
      })
      .filter(Boolean) as any[];

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid questions found in CSV. Ensure skillLevel is entry, mid, or advanced." },
        { status: 400 }
      );
    }

    const result = await Question.insertMany(questions);

    return NextResponse.json({
      success: true,
      message: `Uploaded ${result.length} questions from CSV`,
      count: result.length,
    });
  } catch (error) {
    console.error("CSV upload error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to complete this action. Please try again." },
      { status: 500 }
    );
  }
});