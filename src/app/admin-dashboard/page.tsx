import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Container } from 'react-bootstrap';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // TEMPORARY BYPASS — LETS admin@foo.com IN NO MATTER WHAT
  const email = session?.user?.email?.toLowerCase();
  const isTestAdmin = email === 'admin@foo.com';

  // Only block non-logged-in users — let admin@foo.com through always
  if (!session?.user && !isTestAdmin) {
    redirect('/auth/signin');
  }

  // If you're here, you're either logged in OR admin@foo.com
  // So show the admin panel
  return (
    <>
      <Container fluid className="text-white text-center py-5" style={{ background: '#003300' }}>
        <Image src="/uh-seal.png" alt="UH Mānoa" width={90} height={90} priority />
        <h1 className="display-5 fw-bold mt-3 text-danger">ADMIN CONTROL PANEL</h1>
        <p className="lead fs-3">Full System Access</p>
      </Container>

      <Container className="my-5">
        <div className="row g-5 justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Link href="/admin/users" className="text-decoration-none">
              <Button variant="danger" size="lg" className="w-100 py-5 shadow border-0">
                <strong className="fs-3">Manage Users</strong>
                <br />
                <small>Add • Remove • Change Roles</small>
              </Button>
            </Link>
          </div>

          <div className="col-md-8 col-lg-6">
            <Link href="/admin/sessions" className="text-decoration-none">
              <Button variant="danger" size="lg" className="w-100 py-5 shadow border-0">
                <strong className="fs-3">Manage Sessions</strong>
                <br />
                <small>Create • Drop • Edit Any</small>
              </Button>
            </Link>
          </div>

          <div className="col-md-8 col-lg-6">
            <Link href="/admin/sessions/create" className="text-decoration-none">
              <Button variant="dark" size="lg" className="w-100 py-5 shadow border-0">
                <strong className="fs-3">Create Session (Any User)</strong>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
