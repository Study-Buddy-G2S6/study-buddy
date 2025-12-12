'use client';

import React, { useState } from 'react';
import { Row, Col, Form, InputGroup } from 'react-bootstrap';
import UserSessionCard from '@/components/UserSessionCard';
import { Session, User, Course } from '@prisma/client';

type SessionWithRelations = Session & { user: User; course: Course };

export default function MySessionsListClient({ sessions }: { sessions: SessionWithRelations[] }) {
  const [query, setQuery] = useState('');

  const filtered = sessions.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const text = [
      s.name ?? '',
      s.course?.courseName ?? '',
      s.course?.courseTitle ?? '',
      s.location ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });

  return (
    <>
      {/* Search Bar */}
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <InputGroup>
            <InputGroup.Text>🔎</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by session name, course, or location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="shadow-sm"
            />
          </InputGroup>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filtered.map((session) => (
          <Col key={session.id}>
            <UserSessionCard session={session} user={session.user} course={session.course} />
          </Col>
        ))}
        {filtered.length === 0 && (
          <Col>
            <p className="text-center text-muted">No sessions match your search.</p>
          </Col>
        )}
      </Row>
    </>
  );
}
