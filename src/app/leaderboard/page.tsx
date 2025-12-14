import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// Ensure this page always renders on the server (no ISR/SSG) so Prisma works on Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const leaders = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      userName: true,
      points: true,
    },
    orderBy: [
      { points: 'desc' },
      { email: 'asc' },
    ],
    take: 50,
  });

  return (
    <div className="container py-5">
      <h1 className="display-5 fw-bold text-dark mb-3">Session Leaderboard</h1>
      <p className="text-muted mb-4">Top 50 users by sessions created (tracked via points).</p>

      {leaders.length === 0 ? (
        <div className="alert alert-info">No leaderboard data yet. Create a session to get started.</div>
      ) : (
        <div className="table-responsive shadow-sm rounded-3 overflow-hidden bg-white">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: '80px' }}>Rank</th>
                <th scope="col">User</th>
                <th scope="col" style={{ width: '140px' }}>Sessions</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader, index) => (
                <tr key={leader.id}>
                  <td className="fw-semibold">#{index + 1}</td>
                  <td>
                    <div className="fw-semibold text-dark">{leader.userName || leader.email}</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{leader.email}</div>
                  </td>
                  <td className="fw-bold text-primary">{leader.points ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
