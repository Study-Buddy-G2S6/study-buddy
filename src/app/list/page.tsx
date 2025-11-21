// src/app/list/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Container } from 'react-bootstrap';

export default async function StudySessionsList() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  return (
    <Container className="my-5 py-5 text-center">
      <h1 className="display-5 fw-bold mb-5 text-success">Study Sessions</h1>
      <div className="bg-white shadow-lg rounded-4 p-5 mx-auto" style={{ maxWidth: '700px' }}>
        <h2 className="text-primary mb-4">Coming Soon!</h2>
        <p className="lead text-muted mb-4">Create, join, and manage ICS study sessions with your classmates.</p>
        <p className="text-muted">This feature is under active development by the Study Buddy team.</p>
        <div className="mt-5">
          <Link href="/user-home">
            <Button variant="success" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
