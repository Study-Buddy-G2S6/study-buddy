import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import SessionsList from '@/components/SessionsList';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/** Render a list of all study sessions. */
const StudySessionsPage = async () => {
  // Protect the page, only logged in users can access it.
  const userSession = await getServerSession(authOptions);
  loggedInProtectedPage(
    userSession as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );

  const currentUserEmail = (userSession && userSession.user && userSession.user.email) || '';

  // Fetch all sessions from the database
  const allSessions = await prisma.session.findMany({
    include: {
      course: true,
      user: true,
    },
  });

  // Sort sessions: user's sessions first (sorted by date), then other sessions (sorted by date)
  const sortedSessions = allSessions.sort((a, b) => {
    const aIsOwner = a.owner === currentUserEmail;
    const bIsOwner = b.owner === currentUserEmail;

    // If one is owner and other isn't, owner comes first
    if (aIsOwner && !bIsOwner) return -1;
    if (!aIsOwner && bIsOwner) return 1;

    // If both are same ownership status, sort by startDate
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  console.log('All sessions count: ', sortedSessions.length);

  return (
    <SessionsList sessions={sortedSessions} currentUserEmail={currentUserEmail} />
  );
};

export default StudySessionsPage;
