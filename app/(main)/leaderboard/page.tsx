// app/leaderboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Medal,
  Star,
  Rocket,
  BookOpen,
  Sprout,
  Flame,
  TrendingUp,
  Award,
  FileText,
  Briefcase,
  Globe,
  ChevronUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Crown,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────

type RankingType = "overall" | "category" | "state" | "monthly";

interface RankingEntry {
  _id: string;
  userId: string;
  userName: string;
  state: string;
  country: string;
  skillLevel: string;
  rankingType: RankingType;
  categoryName?: string;
  score: number;
  examsTaken: number;
  certificatesEarned: number;
  averageScore: number;
  rank: number;
  previousRank?: number;
  period?: string;
  updatedAt: string;
}

interface LeaderboardResponse {
  success: boolean;
  type: string;
  count: number;
  rankings: RankingEntry[];
}

// ─── Color System (from screenshot) ───────────────────────

const colors = {
  // Primary purple scale
  primary: {
    light: "#E8E0F0",
    lightHover: "#DDD2EC",
    lightActive: "#D0C0E8",
    normal: "#7C5CFC",
    normalHover: "#6B4BE8",
    normalActive: "#5A3AD4",
    dark: "#5E3FDB",
    darkHover: "#4E33C4",
    darkActive: "#3E27AD",
    darker: "#2E1B96",
  },
  // Supporting palette
  surface: {
    bg: "#0F0F1A",
    card: "#16162A",
    cardHover: "#1E1E3A",
    border: "#2A2A4A",
    borderHover: "#3A3A6A",
  },
  text: {
    primary: "#F0F0FF",
    secondary: "#A0A0C0",
    muted: "#606080",
  },
  // Rank colors
  rank: {
    platinum: "#E5E4E2",
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    star: "#FFA500",
    rocket: "#00D4FF",
    book: "#7C5CFC",
    sprout: "#4ADE80",
  },
};

// ─── Ranking Descriptions ─────────────────────────────────

const RANK_DESCRIPTIONS = [
  {
    tier: "Platinum Achiever",
    icon: Trophy,
    color: colors.rank.platinum,
    bgGradient: "from-slate-200/10 to-slate-400/5",
    description:
      "You've reached the highest level of excellence. Your dedication, consistency, and outstanding performance make you a role model within the A.R.W.P.C community.",
  },
  {
    tier: "Gold Performer",
    icon: Medal,
    color: colors.rank.gold,
    bgGradient: "from-yellow-500/10 to-yellow-600/5",
    description:
      "Excellent work! You're among A.R.W.P.C's top-performing learners. Keep pushing your limits—you're closer than ever to the top spot.",
  },
  {
    tier: "Silver Performer",
    icon: Star,
    color: colors.rank.silver,
    bgGradient: "from-gray-300/10 to-gray-400/5",
    description:
      "Great progress! Your commitment to learning is paying off. Stay consistent and continue building your skills.",
  },
  {
    tier: "Rising Star",
    icon: Sparkles,
    color: colors.rank.star,
    bgGradient: "from-orange-500/10 to-orange-600/5",
    description:
      "You're making remarkable progress and climbing the rankings quickly. Keep learning and you'll soon join the top performers.",
  },
  {
    tier: "Career Builder",
    icon: Rocket,
    color: colors.rank.rocket,
    bgGradient: "from-cyan-500/10 to-cyan-600/5",
    description:
      "You've completed important milestones and are steadily preparing for internship and remote work opportunities.",
  },
  {
    tier: "Active Learner",
    icon: BookOpen,
    color: colors.rank.book,
    bgGradient: "from-violet-500/10 to-violet-600/5",
    description:
      "Your consistency is inspiring. Every lesson completed brings you one step closer to your goals.",
  },
  {
    tier: "New Explorer",
    icon: Sprout,
    color: colors.rank.sprout,
    bgGradient: "from-green-500/10 to-green-600/5",
    description:
      "Welcome to A.R.W.P.C! Every successful professional starts somewhere. Keep learning and your achievements will soon speak for themselves.",
  },
];

// ─── Motivation Messages ──────────────────────────────────

const MOTIVATION_MESSAGES = [
  {
    title: "Daily Motivation",
    message: "Small efforts every day create extraordinary careers tomorrow.",
    icon: Target,
  },
  {
    title: "Weekly Motivation",
    message:
      "You've invested another week in your future. Keep showing up—success follows consistency.",
    icon: Calendar,
  },
  {
    title: "Learning Streak",
    message:
      "Amazing! You've maintained your learning streak. Don't break the momentum!",
    icon: Flame,
  },
  {
    title: "Keep Climbing",
    message:
      "Every lesson completed improves your ranking. Stay focused—your next achievement is within reach.",
    icon: TrendingUp,
  },
  {
    title: "You're Almost There",
    message:
      "You're only a few points away from the next ranking level. Keep learning and unlock your next milestone.",
    icon: Zap,
  },
  {
    title: "Inspire Others",
    message: "Your progress motivates other learners. Keep leading by example.",
    icon: Star,
  },
  {
    title: "Success Reminder",
    message:
      "Remember why you started. Every course, every assessment, and every certificate brings you closer to the career you deserve.",
    icon: Award,
  },
];

// ─── Achievement Notifications ────────────────────────────

const ACHIEVEMENTS = [
  {
    icon: Award,
    title: "New Badge Unlocked",
    message: "Congratulations! You've earned a new A.R.W.P.C achievement badge.",
    color: "#FFD700",
  },
  {
    icon: TrendingUp,
    title: "Ranking Improved",
    message:
      "Fantastic! You've moved up the leaderboard. Keep learning and keep climbing.",
    color: "#7C5CFC",
  },
  {
    icon: FileText,
    title: "Certification Earned",
    message:
      "Your certification has boosted your Career Score and leaderboard ranking.",
    color: "#00D4FF",
  },
  {
    icon: Flame,
    title: "Learning Streak Maintained",
    message: "You're building an incredible habit. Keep your streak alive!",
    color: "#FF6B35",
  },
  {
    icon: Briefcase,
    title: "Career Milestone Achieved",
    message:
      "You've unlocked new internship and remote job opportunities through your continued progress.",
    color: "#4ADE80",
  },
  {
    icon: Globe,
    title: "Top Performer",
    message:
      "Outstanding! You're now among this week's top-performing learners. Congratulations on your dedication and hard work.",
    color: "#A855F7",
  },
];

// ─── Helper Components ────────────────────────────────────

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function getRankTier(rank: number): (typeof RANK_DESCRIPTIONS)[number] {
  if (rank === 1) return RANK_DESCRIPTIONS[0]; // Platinum
  if (rank <= 3) return RANK_DESCRIPTIONS[1]; // Gold
  if (rank <= 10) return RANK_DESCRIPTIONS[2]; // Silver
  if (rank <= 25) return RANK_DESCRIPTIONS[3]; // Rising Star
  if (rank <= 50) return RANK_DESCRIPTIONS[4]; // Career Builder
  if (rank <= 100) return RANK_DESCRIPTIONS[5]; // Active Learner
  return RANK_DESCRIPTIONS[6]; // New Explorer
}

function getRankChange(entry: RankingEntry) {
  if (!entry.previousRank) return null;
  const diff = entry.previousRank - entry.rank;
  if (diff > 0)
    return { direction: "up" as const, value: diff, icon: ArrowUpRight };
  if (diff < 0)
    return {
      direction: "down" as const,
      value: Math.abs(diff),
      icon: ArrowDownRight,
    };
  return { direction: "same" as const, value: 0, icon: Minus };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const hues = [260, 280, 300, 320, 200, 220, 240];
  const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  return `hsl(${hues[hash % hues.length]}, 70%, 60%)`;
}

// ─── Rank Badge Component ─────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  const tier = getRankTier(rank);
  const Icon = tier.icon;

  if (rank <= 3) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${tier.color}20, ${tier.color}40)`,
          boxShadow: `0 0 20px ${tier.color}30`,
        }}
      >
        <Icon className="w-6 h-6" style={{ color: tier.color }} />
        {rank === 1 && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1"
          >
            <Crown className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
      style={{
        background: `linear-gradient(135deg, ${tier.color}15, ${tier.color}30)`,
        color: tier.color,
        border: `1px solid ${tier.color}40`,
      }}
    >
      {rank}
    </div>
  );
}

// ─── Rank Change Indicator ────────────────────────────────

function RankChangeIndicator({ entry }: { entry: RankingEntry }) {
  const change = getRankChange(entry);
  if (!change) return null;

  const Icon = change.icon;
  const color =
    change.direction === "up"
      ? "#4ADE80"
      : change.direction === "down"
        ? "#F87171"
        : colors.text.muted;

  return (
    <div className="flex items-center gap-1 text-xs" style={{ color }}>
      <Icon className="w-3 h-3" />
      <span>
        {change.direction === "same"
          ? "-"
          : `${change.direction === "up" ? "+" : "-"}${change.value}`}
      </span>
    </div>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────

function LeaderboardRow({
  entry,
  index,
}: {
  entry: RankingEntry;
  index: number;
}) {
  const tier = getRankTier(entry.rank);
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, backgroundColor: colors.surface.cardHover }}
      className="group relative flex items-center gap-4 px-6 py-4 rounded-xl border transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: colors.surface.card,
        borderColor: isTop3 ? `${tier.color}30` : colors.surface.border,
      }}
    >
      {/* Glow effect for top 3 */}
      {isTop3 && (
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${tier.color}08, transparent, ${tier.color}08)`,
          }}
        />
      )}

      {/* Rank */}
      <div className="flex-shrink-0">
        <RankBadge rank={entry.rank} />
      </div>

      {/* Avatar */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: getAvatarColor(entry.userName) }}
      >
        {getInitials(entry.userName)}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: colors.text.primary }}
          >
            {entry.userName}
          </h3>
          <RankChangeIndicator entry={entry} />
        </div>
        <div
          className="flex items-center gap-2 text-xs mt-0.5"
          style={{ color: colors.text.muted }}
        >
          <span>{entry.state}</span>
          <span>•</span>
          <span>{entry.country}</span>
          <span>•</span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              backgroundColor: `${tier.color}15`,
              color: tier.color,
            }}
          >
            {tier.tier}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-xs">
        <div className="text-center">
          <div
            className="font-bold text-sm"
            style={{ color: colors.primary.normal }}
          >
            {entry.score.toLocaleString()}
          </div>
          <div style={{ color: colors.text.muted }}>Score</div>
        </div>
        <div className="text-center">
          <div
            className="font-bold text-sm"
            style={{ color: colors.text.primary }}
          >
            {entry.examsTaken}
          </div>
          <div style={{ color: colors.text.muted }}>Exams</div>
        </div>
        <div className="text-center">
          <div
            className="font-bold text-sm"
            style={{ color: colors.text.primary }}
          >
            {entry.certificatesEarned}
          </div>
          <div style={{ color: colors.text.muted }}>Certs</div>
        </div>
        <div className="text-center">
          <div
            className="font-bold text-sm"
            style={{ color: colors.text.primary }}
          >
            {entry.averageScore}%
          </div>
          <div style={{ color: colors.text.muted }}>Avg</div>
        </div>
      </div>

      {/* Mobile Score */}
      <div className="md:hidden text-right">
        <div
          className="font-bold text-sm"
          style={{ color: colors.primary.normal }}
        >
          {entry.score.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Podium Card ──────────────────────────────────────────

function PodiumCard({
  entry,
  position,
}: {
  entry: RankingEntry;
  position: number;
}) {
  const tier = getRankTier(position);
  const Icon = tier.icon;
  const heights = ["h-64", "h-52", "h-44"];
  const positions = ["order-2", "order-1", "order-3"];
  const glowColors = [
    "shadow-yellow-500/20",
    "shadow-slate-300/20",
    "shadow-orange-700/20",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position * 0.15, type: "spring", stiffness: 100 }}
      className={`relative flex flex-col items-center ${positions[position - 1]} ${heights[position - 1]}`}
    >
      <div
        className={`relative flex flex-col items-center justify-end w-full max-w-[180px] rounded-t-2xl p-4 pb-6 ${glowColors[position - 1]} shadow-2xl`}
        style={{
          background: `linear-gradient(180deg, ${tier.color}15, ${tier.color}05)`,
          borderTop: `2px solid ${tier.color}50`,
          borderLeft: `1px solid ${tier.color}20`,
          borderRight: `1px solid ${tier.color}20`,
        }}
      >
        {/* Position Number */}
        <div
          className="absolute -top-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: tier.color,
            color: position === 1 ? "#1a1a2e" : "#fff",
            boxShadow: `0 0 20px ${tier.color}60`,
          }}
        >
          {position}
        </div>

        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white mb-3 border-2"
          style={{
            backgroundColor: getAvatarColor(entry.userName),
            borderColor: tier.color,
            boxShadow: `0 0 30px ${tier.color}30`,
          }}
        >
          {getInitials(entry.userName)}
        </div>

        {/* Name */}
        <h3
          className="font-bold text-sm text-center mb-1 truncate w-full"
          style={{ color: colors.text.primary }}
        >
          {entry.userName}
        </h3>

        {/* Score */}
        <div className="text-2xl font-black mb-1" style={{ color: tier.color }}>
          {entry.score.toLocaleString()}
        </div>

        {/* Tier */}
        <div
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: `${tier.color}20`,
            color: tier.color,
          }}
        >
          <Icon className="w-3 h-3" />
          <span>{tier.tier}</span>
        </div>

        {/* Rank Change */}
        <div className="mt-2">
          <RankChangeIndicator entry={entry} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────

const FILTER_TABS = [
  { value: "overall" as RankingType, label: "Overall", icon: Globe },
  { value: "category" as RankingType, label: "Category", icon: Target },
  { value: "state" as RankingType, label: "State", icon: MapPin },
  { value: "monthly" as RankingType, label: "Monthly", icon: Calendar },
];

function MapPin({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── Motivation Carousel ────────────────────────────────

function MotivationCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % MOTIVATION_MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const msg = MOTIVATION_MESSAGES[current];
  const Icon = msg.icon;

  return (
    <motion.div
      key={current}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative overflow-hidden rounded-2xl p-6 border"
      style={{
        backgroundColor: colors.surface.card,
        borderColor: `${colors.primary.normal}20`,
      }}
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: colors.primary.normal }}
      />
      <div className="relative flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary.normal}30, ${colors.primary.dark}20)`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: colors.primary.normal }} />
        </div>
        <div>
          <h3
            className="font-semibold text-sm mb-1"
            style={{ color: colors.primary.light }}
          >
            {msg.title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            {msg.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Achievement Marquee ─────────────────────────────────

function AchievementMarquee() {
  return (
    <div className="relative overflow-hidden py-4">
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10"
        style={{
          background: `linear-gradient(90deg, ${colors.surface.bg}, transparent)`,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10"
        style={{
          background: `linear-gradient(270deg, ${colors.surface.bg}, transparent)`,
        }}
      />
      <motion.div
        animate={{ x: [0, -1920] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex gap-6 whitespace-nowrap"
      >
        {[...ACHIEVEMENTS, ...ACHIEVEMENTS].map((ach, i) => {
          const Icon = ach.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2 rounded-full border flex-shrink-0"
              style={{
                backgroundColor: `${ach.color}08`,
                borderColor: `${ach.color}20`,
              }}
            >
              <Icon className="w-4 h-4" style={{ color: ach.color }} />
              <span
                className="text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                {ach.title}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Rank Descriptions Section ──────────────────────────

function RankDescriptions() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {RANK_DESCRIPTIONS.map((rank, i) => {
        const Icon = rank.icon;
        const isExpanded = expanded === i;

        return (
          <motion.div
            key={rank.tier}
            whileHover={{ y: -2 }}
            className="relative rounded-xl p-5 border cursor-pointer overflow-hidden"
            style={{
              backgroundColor: colors.surface.card,
              borderColor: `${rank.color}20`,
            }}
            onClick={() => setExpanded(isExpanded ? null : i)}
          >
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${rank.color}08, transparent)`,
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${rank.color}20, ${rank.color}10)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: rank.color }} />
                </div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: colors.text.primary }}
                >
                  {rank.tier}
                </h3>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs leading-relaxed overflow-hidden"
                    style={{ color: colors.text.secondary }}
                  >
                    {rank.description}
                  </motion.p>
                )}
              </AnimatePresence>
              {!isExpanded && (
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: colors.text.muted }}
                >
                  {rank.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState<RankingType>("overall");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type: activeType,
        limit: limit.toString(),
      });
      const res = await fetch(`/api/leaderboard?${params}`);
      const data: LeaderboardResponse = await res.json();

      if (!data.success) throw new Error("Failed to fetch rankings");
      setRankings(data.rankings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Fallback demo data
      setRankings(generateDemoData(activeType));
    } finally {
      setLoading(false);
    }
  }, [activeType, limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const topThree = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <div
      className=""
      style={{ backgroundColor: colors.surface.bg, color: colors.text.primary }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-3 px-4 sm:px-2 lg:px-8">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: colors.primary.normal }}
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 border"
            style={{
              backgroundColor: `${colors.primary.normal}15`,
              borderColor: `${colors.primary.normal}30`,
              color: colors.primary.light,
            }}
          >
            <Trophy className="w-4 h-4" style={{ color: colors.rank.gold }} />
            A.R.W.P.C Leaderboard
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4"
            style={{
              background: `linear-gradient(135deg, ${colors.text.primary}, ${colors.primary.normal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Rise, Learn, Lead!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            The A.R.W.P.C Leaderboard celebrates learners who consistently invest
            in their growth. Every course completed, certification earned, and
            milestone achieved moves you closer to the top. Keep learning, stay
            consistent, and let your progress inspire others.
          </motion.p>
        </div>
      </section>

      {/* Achievement Marquee */}
      <AchievementMarquee />

      {/* Motivation Banner */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <MotivationCarousel />
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveType(tab.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border"
                  style={{
                    backgroundColor: isActive
                      ? `${colors.primary.normal}20`
                      : colors.surface.card,
                    borderColor: isActive
                      ? `${colors.primary.normal}50`
                      : colors.surface.border,
                    color: isActive
                      ? colors.primary.light
                      : colors.text.secondary,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-2">
              <Filter
                className="w-4 h-4"
                style={{ color: colors.text.muted }}
              />
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-[#7C5CFC]"
                style={{
                  backgroundColor: colors.surface.card,
                  borderColor: colors.surface.border,
                  color: colors.text.primary,
                }}
              >
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Podium */}
      {topThree.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-center gap-4 sm:gap-8">
              {topThree.map((entry, i) => (
                <PodiumCard key={entry._id} entry={entry} position={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-t-transparent"
                style={{ borderColor: colors.primary.normal }}
              />
              <p style={{ color: colors.text.muted }}>Loading rankings...</p>
            </div>
          ) : error ? (
            <div
              className="text-center py-12 rounded-xl border"
              style={{
                backgroundColor: `${colors.rank.rocket}10`,
                borderColor: `${colors.rank.rocket}20`,
              }}
            >
              <p style={{ color: colors.text.secondary }}>{error}</p>
              <button
                onClick={fetchRankings}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: colors.primary.normal,
                  color: "#fff",
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {rest.map((entry, i) => (
                  <LeaderboardRow key={entry._id} entry={entry} index={i} />
                ))}
              </AnimatePresence>

              {rest.length === 0 && (
                <div
                  className="text-center py-12 rounded-xl border"
                  style={{
                    backgroundColor: colors.surface.card,
                    borderColor: colors.surface.border,
                  }}
                >
                  <Sprout
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: colors.rank.sprout }}
                  />
                  <p style={{ color: colors.text.secondary }}>
                    No rankings found for this filter.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rank Descriptions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-xl font-bold mb-6 flex items-center gap-2"
            style={{ color: colors.text.primary }}
          >
            <Award
              className="w-5 h-5"
              style={{ color: colors.primary.normal }}
            />
            Ranking Tiers
          </h2>
          <RankDescriptions />
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center border"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.darker}40, ${colors.surface.card})`,
              borderColor: `${colors.primary.normal}30`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: colors.primary.normal }}
            />
            <div className="relative">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ color: colors.text.primary }}
              >
                The Leaderboard Awaits You
              </h2>
              <p
                className="text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto"
                style={{ color: colors.text.secondary }}
              >
                The leaderboard isn't just about being first—it's about
                celebrating growth, consistency, and determination. Every lesson
                you complete, every certification you earn, and every
                opportunity you pursue is another step toward the career you've
                always dreamed of.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/25"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.normal}, ${colors.primary.dark})`,
                }}
              >
                Continue Learning & Climb the Leaderboard
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ─── Demo Data Generator ────────────────────────────────

function generateDemoData(type: RankingType): RankingEntry[] {
  const names = [
    "Alex Johnson",
    "Sarah Chen",
    "Mike Rivera",
    "Emma Wilson",
    "David Kim",
    "Lisa Park",
    "James Brown",
    "Nina Patel",
    "Tom Anderson",
    "Sophie Martin",
    "Ryan Lee",
    "Olivia Garcia",
    "Daniel White",
    "Aisha Mohammed",
    "Chris Taylor",
    "Mia Thompson",
    "Kevin Nguyen",
    "Zara Ali",
    "Ben Carter",
    "Lily Wang",
  ];

  const states = ["California", "New York", "Texas", "Florida", "Illinois"];
  const countries = ["USA", "UK", "Canada", "Australia", "India"];
  const categories = ["Web Development", "Data Science", "Design", "Marketing"];

  return names.map((name, i) => ({
    _id: `demo-${i}`,
    userId: `user-${i}`,
    userName: name,
    state: states[i % states.length],
    country: countries[i % countries.length],
    skillLevel: ["Beginner", "Intermediate", "Advanced", "Expert"][i % 4],
    rankingType: type,
    categoryName:
      type === "category" ? categories[i % categories.length] : undefined,
    score: Math.floor(10000 - i * 450 + Math.random() * 200),
    examsTaken: Math.floor(50 - i * 2 + Math.random() * 10),
    certificatesEarned: Math.floor(20 - i + Math.random() * 5),
    averageScore: Math.floor(95 - i * 2 + Math.random() * 5),
    rank: i + 1,
    previousRank: i + 1 + Math.floor(Math.random() * 5) - 2,
    period: type === "monthly" ? "2026-06" : undefined,
    updatedAt: new Date().toISOString(),
  }));
}
