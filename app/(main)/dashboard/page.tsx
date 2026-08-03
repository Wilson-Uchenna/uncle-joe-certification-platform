import { auth } from '@/lib/auth';
import { Clock3 } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(), // ← Added headers
  });

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[70vh] px-4">
      <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
        <Clock3 className="w-7 h-7 text-indigo-600" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-3">
        Welcome, {session.user.name} 👋
      </h1>

      <p className="text-[15px] text-slate-500 leading-relaxed max-w-md">
        Kindly hold on for your registration to scale through before starting this...
      </p>
    </div>
  );
}