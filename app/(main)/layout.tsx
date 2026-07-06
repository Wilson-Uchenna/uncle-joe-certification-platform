import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';


export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await authClient.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="/dashboard" className="font-bold text-xl">Uncle Joe</a>
          <div className="flex gap-4">
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/categories" className="text-gray-600 hover:text-gray-900">Categories</a>
            <a href="/leaderboard" className="text-gray-600 hover:text-gray-900">Leaderboard</a>
            <form action="/api/auth/sign-out" method="post">
              <button type="submit" className="text-red-600 hover:text-red-700">Logout</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}