'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateSessionForm from '@/components/CreateSessionForm';
import { Container, Form, Alert, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function AdminCreateSessionPage() {
  const { data: session, status } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch users client-side (simple and works)
  const [users, setUsers] = useState<{ id: number; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users') // We'll create this tiny API in a second
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (status === 'loading') return <p>Loading...</p>;

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return (
      <Container className="py-5 text-center">
        <h1>Access Denied</h1>
        <p>Only admins can create sessions for other users.</p>
        <Link href="/">Go Home</Link>
      </Container>
    );
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Admin: Create Session for Any User</h1>

      <Alert variant="success">
        Select a user below. The session will be created under their name and award points to them.
      </Alert>

      <Form.Group className="mb-5">
        <Form.Label className="fw-bold fs-5">Select User</Form.Label>
        <Form.Select value={selectedUserId || ''} onChange={(e) => setSelectedUserId(Number(e.target.value))} required>
          <option value="">-- Choose a user --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
              {session.user?.email === user.email ? ' (You)' : ''}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {selectedUserId ? (
        <CreateSessionForm overrideUserId={selectedUserId} />
      ) : (
        <p className="text-muted">Please select a user to continue.</p>
      )}

      <div className="mt-4">
        <Link href="/admin/sessions">
          <Button variant="secondary">Back to Manage Sessions</Button>
        </Link>
      </div>
    </Container>
  );
}
