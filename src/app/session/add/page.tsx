'use client';

import { useState } from 'react';
import { Button, Form, Alert, Card } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

export default function CreateSessionPage() {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    location: '',
    notes: '',
    start: '',
    end: '',
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/study-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        course: formData.course,
        location: formData.location || null,
        notes: formData.notes || null,
        start: formData.start,
        end: formData.end || null,
      }),
    });

    if (res.ok) {
      setMessage('Session created successfully! Taking you to the calendar...');
      setTimeout(() => router.push('/calendar'), 1800);
    } else {
      setMessage('Failed to create session. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      {/* This matches your navbar link exactly */}
      <h1 className="text-dark mb-5 fw-bold display-5">Create Session</h1>

      <Card className="shadow-lg border-0">
        <Card.Body className="p-5">
          {message && (
            <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-4">
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Title</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="e.g., ICS 314 Midterm Review"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Course</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="e.g., ICS 314"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Start Date/Time</Form.Label>
              <Form.Control
                required
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">End Date/Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., POST 126, Hamilton Library, Zoom link"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-5">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Any extra details for attendees..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" size="lg" type="submit">
                Create Session
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
