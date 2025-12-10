import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Session } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { prisma } from '@/lib/prisma';
import EditSessionForm from '@/components/EditSessionForm';

export default async function EditSession({ params }: { params: { id: string } }) {
  // Protect the page, only logged in users can access it.
  const userSession = await getServerSession(authOptions);
  loggedInProtectedPage(
    userSession as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const id = Number(params.id);
  // console.log(id);
  const session: Session | null = await prisma.session.findUnique({
    where: { id },
  });
  // console.log(session);
  if (!session) {
    return notFound();
  }

  return (
    <main>
      <EditSessionForm session={session} />
    </main>
  );
}
