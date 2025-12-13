import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { loggedInProtectedPage } from '@/lib/page-protection';
import EditUserProfileForm from '@/components/EditUserProfileForm';

export default async function EditSession({ params }: { params: { id: string } }) {
  // Protect the page, only logged in users can access it.
  const userSession = await getServerSession(authOptions);
  loggedInProtectedPage(
    userSession as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <main>
      <EditUserProfileForm userId={Number(params.id)} />
    </main>
  );
}
