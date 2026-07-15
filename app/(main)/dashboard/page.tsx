
import { DashboardCard } from '@/app/_components/DashBoardCard';
import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';
import { Award, BarChart3, Bell, BookOpen, Briefcase, FileText, Gem, PlayCircle, Trophy } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const  session = await auth.api.getSession({
    headers: await headers(), // ← Added headers
  });

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back, {session.user.name} 👋
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed max-w-lg">
            You're making great progress toward your career goals. Continue learning, earn more certifications, and unlock exciting internship and remote job opportunities.
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <span className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            🔥 5-day streak
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            🎯 Today's goal: complete one lesson
          </span>
        </div>
      </div>

      {/* Section Title */}
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Dashboard Overview
      </h2>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="My Learning"
          description="Continue where you left off and keep building skills that employers value."
          linkText="Continue Learning"
          href="/my-learning"
          icon={PlayCircle}
          iconColor="blue"
        />
        <DashboardCard
          title="My Courses"
          description="Browse all your enrolled courses, track your progress, and complete lessons at your own pace."
          linkText="View Courses"
          href="/my-courses"
          icon={BookOpen}
          iconColor="amber"
        />
        <DashboardCard
          title="Learning Progress"
          description="Monitor your course completion, assessment scores, certifications earned, and learning streak."
          linkText="View Progress"
          href="/learning-progress"
          icon={BarChart3}
          iconColor="emerald"
        />
        <DashboardCard
          title="Certifications"
          description="Complete your first course and assessment to earn your first African Remote Workers Professional Certification."
          linkText="Start Learning"
          href="/certificates"
          icon={Award}
          iconColor="rose"
          status="Not started"
          statusVariant="neutral"
        />
        <DashboardCard
          title="Career Opportunities"
          description="Explore internships and remote jobs recommended based on your skills and certifications."
          linkText="Explore Opportunities"
          href="/career-opportunities"
          icon={Briefcase}
          iconColor="purple"
          status="12 new"
          statusVariant="success"
        />
        <DashboardCard
          title="Applications"
          description="Ready to put your skills into action? Explore internships and remote jobs that match your profile."
          linkText="Find Opportunities"
          href="/applications"
          icon={FileText}
          iconColor="teal"
          status="Not started"
          statusVariant="neutral"
        />
        <DashboardCard
          title="Leaderboard"
          description="See how you're progressing among other learners and celebrate your achievements."
          linkText="View Rankings"
          href="/leaderboard"
          icon={Trophy}
          iconColor="orange"
          status="Rank #48"
          statusVariant="warning"
        />
        <DashboardCard
          title="Achievements"
          description="Unlock badges and celebrate every milestone on your learning journey."
          linkText="View Achievements"
          href="/achievements"
          icon={Gem}
          iconColor="indigo"
          status="3 unlocked"
          statusVariant="accent"
        />
        <DashboardCard
          title="Notifications"
          description="We'll notify you when new opportunities, courses, or updates become available."
          linkText="View Notifications"
          href="/notifications"
          icon={Bell}
          iconColor="slate"
          status="Not started"
          statusVariant="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-7">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-lg hover:bg-slate-800 transition">
            Start a New Course
          </button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition">
            Take Practice Exam
          </button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition">
            Update Profile
          </button>
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition">
            Browse Jobs
          </button>
        </div>
      </div>
    </>
  );
}