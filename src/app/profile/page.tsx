import { getServerSession } from 'next-auth';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import React from 'react';
import { Button, Container } from 'react-bootstrap';
import Profile from '@/components/Profile';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const UserProfile = async () => {
  // Protect the page, only logged in users can access it.
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );

  // Load the full user record with enrolled courses
  const userId = session?.user?.id ? Number(session.user.id) : null;

  let userRecord;
  if (userId) {
    userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: { courses: { include: { course: true } } },
    });
  } else if (session?.user?.email) {
    userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { courses: { include: { course: true } } },
    });
  } else {
    userRecord = null;
  }

  const fullUser = userRecord
    ? {
      ...userRecord,
      courses: (userRecord.courses ?? []).map((cu) => cu.course),
    }
    : null;

  return (
    <main>
      <Container>
        <Profile user={(fullUser as any) ?? (session?.user as any)} />
        <Button
          href={`/profile/edit/${(fullUser as any)?.id ?? (session?.user as any)?.id}`}
          as="a"
          variant="primary"
          className="ms-3"
        >
          Edit Profile
        </Button>
      </Container>
    </main>
  );
};

export default UserProfile;
