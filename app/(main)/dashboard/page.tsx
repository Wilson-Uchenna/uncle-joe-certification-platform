
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { data} = await authClient.getSession();

  if (!data?.user) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {data.user.name}</h1>
      {/* <p className="text-gray-600 mb-6">Skill Level: {data.user.skillLevel}</p> */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/categories" className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100">
          <h2 className="font-bold text-lg mb-2">Take Exam</h2>
          <p className="text-sm text-gray-600">Choose a certification category and start your exam</p>
        </a>
        
        <a href="/results" className="p-6 bg-green-50 rounded-lg hover:bg-green-100">
          <h2 className="font-bold text-lg mb-2">My Results</h2>
          <p className="text-sm text-gray-600">View your past exam results</p>
        </a>
        
        <a href="/leaderboard" className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100">
          <h2 className="font-bold text-lg mb-2">Leaderboard</h2>
          <p className="text-sm text-gray-600">See how you rank against others</p>
        </a>
      </div>
    </div>
  );
}