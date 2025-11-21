// src/app/user-home/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Container } from 'react-bootstrap';

export default async function UserHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const name = session.user?.name?.split(' ')[0] || 'Warrior';

  return (
    <>
      <Container fluid className="text-white text-center py-5" style={{ background: '#003300' }}>
        <Image src="/uh-seal.png" alt="UH Mānoa" width={110} height={110} priority />
        <h1 className="display-4 fw-bold mt-4">
          Aloha,&nbsp;
          {name}
          !
        </h1>
        <p className="lead fs-3">ICS Study Session Hub</p>
      </Container>

      <Container className="my-5">
        <div className="row g-4 justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Link href="/sessions" className="text-decoration-none">
              <Button variant="primary" size="lg" className="w-100 py-5 shadow">
                <strong className="fs-4">Find Study Sessions</strong>
              </Button>
            </Link>
          </div>
          <div className="col-md-6 col-lg-5">
            <Link href="/sessions/create" className="text-decoration-none">
              <Button variant="success" size="lg" className="w-100 py-5 shadow">
                <strong className="fs-4">Create New Session</strong>
              </Button>
            </Link>
          </div>
          <div className="col-md-6 col-lg-5">
            <Link href="/sessions/my" className="text-decoration-none">
              <Button variant="warning" size="lg" className="w-100 py-5 shadow text-dark">
                <strong className="fs-4">My Sessions</strong>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
