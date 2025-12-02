// src/app/admin-dashboard/page.tsx
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Container } from 'react-bootstrap';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email?: string; name?: string; role?: string } | null;
  if (!session?.user || user?.role !== 'ADMIN') redirect('/not-authorized');

  return (
    <>
      <Container fluid className="text-white text-center py-5" style={{ background: '#003300' }}>
        <Image src="/uh-seal.png" alt="UH Mānoa" width={90} height={90} priority />
        <h1 className="display-5 fw-bold mt-3">Admin Control Panel</h1>
        <p className="lead">Manage All Study Sessions</p>
      </Container>

      <Container className="my-5">
        <div className="row g-5 justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Link href="/admin/sessions/create" className="text-decoration-none">
              <Button variant="success" size="lg" className="w-100 py-5 shadow">
                <strong className="fs-4">Create Session (Any User)</strong>
              </Button>
            </Link>
          </div>
          <div className="col-md-8 col-lg-6">
            <Link href="/admin/sessions" className="text-decoration-none">
              <Button variant="danger" size="lg" className="w-100 py-5 shadow">
                <strong className="fs-4">Manage / Drop Any Session</strong>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
