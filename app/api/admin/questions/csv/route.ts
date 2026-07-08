import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/api-utils";
import { Question } from "@/models/Questions";
import mongoose from "mongoose";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle quoted values with commas inside
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.replace(/^"|"$/g, "") || "";
    });
    rows.push(row);
  }
  return rows;
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

        return {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          question: row.question?.trim(),
          options,
          correctAnswer,
          explanation: row.explanation?.trim() || "",
          difficulty: Math.min(5, Math.max(1, parseInt(row.difficulty) || 3)),
          isFinalStage: row.isFinalStage?.toLowerCase() === "true",
          role: row.role?.trim() || null, // NEW: sub-role from CSV
          isActive: true,
          timesUsed: 0,
          timesCorrect: 0,
        };
      })
      .filter(Boolean) as any[];

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid questions found in CSV" },
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