import mongoose, { Schema, Document } from 'mongoose';

export type RankingType = 'category' | 'overall' | 'state' | 'industry' | 'monthly';

export interface IRanking extends Document {
  
  userId: mongoose.Types.ObjectId;
  userName: string;
  state: string;
  country: string;
  skillLevel: string;
  
  rankingType: RankingType;
  categoryId?: mongoose.Types.ObjectId;    // For category rankings
  categoryName?: string;
  
  score: number;
  examsTaken: number;
  certificatesEarned: number;
  averageScore: number;
  
  rank: number;                            // Current position
  previousRank?: number;                   // For "moved up 3 spots"
  
  period?: string;                         // "2026-06" for monthly
  isActive: boolean;
  
  updatedAt: Date;
  createdAt: Date;
}

const RankingSchema = new Schema<IRanking>({

  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  skillLevel: { type: String, required: true },
  
  rankingType: { 
    type: String, 
    enum: ['category', 'overall', 'state', 'industry', 'monthly'], 
    required: true 
  },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  categoryName: String,
  
  score: { type: Number, default: 0 },
  examsTaken: { type: Number, default: 0 },
  certificatesEarned: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  
  rank: { type: Number, required: true },
  previousRank: Number,
  
  period: String,                          // "YYYY-MM" format
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Leaderboard queries
RankingSchema.index({ rankingType: 1, rank: 1 });
RankingSchema.index({ categoryId: 1, rankingType: 1, rank: 1 });
RankingSchema.index({ period: 1, rankingType: 1, rank: 1 });
RankingSchema.index({ betterAuthUserId: 1, rankingType: 1 });

export const Ranking =
  mongoose.models.Ranking || mongoose.model<IRanking>('Ranking', RankingSchema);
export default Ranking;