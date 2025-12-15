import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import AllUsersSessionCard from '@/components/AllUsersSessionCard';
import Link from 'next/link';
import { Button, Container } from 'react-bootstrap';
import { revalidatePath } from 'next/cache';
import DeleteForm from './DeleteForm'; // Assuming you have this client component for delete confirm

export const dynamic = 'force-dynamic';

async function deleteSession(formData: FormData) {
  'use server';
  const sessionId = Number(formData.get('sessionId'));

  const existing = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.session.delete({ where: { id: sessionId } });

      const updatedUser = await tx.user.update({
        where: { id: existing.userId },
        data: { points: { decrement: 1 } },
        select: { points: true },
      });

      if (updatedUser.points < 0) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { points: 0 },
        });
      }
    });
  }

  revalidatePath('/admin/sessions');
}

export default async function AdminSessionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return (
      <Container className="py-5 text-center">
        <h1>Access Denied</h1>
        <p>You must be an admin to view this page.</p>
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </Container>
    );
  }

  const allSessions = await prisma.session.findMany({
    include: {
      course: true,
      user: true,
    },
    orderBy: { startDate: 'desc' },
  });

  return (
    <Container className="py-5">
      <h1 className="mb-4 display-6">Admin: Manage All Study Sessions</h1>

      <Link href="/admin/sessions/create" className="mb-4 d-block">
        <Button variant="success">Create Session (Any User)</Button>
      </Link>

      {allSessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <div className="row g-4">
          {allSessions.map((session) => (
            <div key={session.id} className="col-md-6 col-lg-4">
              <div className="border rounded p-3 shadow-sm bg-white">
                {/* FIXED: Pass flat props to match AllUsersSessionCard expectations */}
                <AllUsersSessionCard session={session} course={session.course} user={session.user} />

                <div className="mt-3 d-flex gap-2">
                  <Link href={`/session/edit/${session.id}`}>
                    <Button variant="primary" size="sm">
                      Edit
                    </Button>
                  </Link>

                  <DeleteForm sessionId={session.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
