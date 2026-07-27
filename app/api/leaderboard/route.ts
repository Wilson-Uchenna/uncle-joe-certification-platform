import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/local-db";
import { Ranking } from "@/models/rankings";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overall";
    const categoryId = searchParams.get("categoryId");
    const state = searchParams.get("state");
    const period = searchParams.get("period");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    
    const query: any = { isActive: true };
    
    if (type === "category" && categoryId) {
      query.categoryId = categoryId;
    } else if (type === "state" && state) {
      query.state = state;
    } else if (type === "monthly" && period) {
      query.period = period;
    }
    
    query.rankingType = type;
    
    const rankings = await Ranking.find(query)
      .sort({ rank: 1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      type,
      count: rankings.length,
      rankings
    });
    
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}