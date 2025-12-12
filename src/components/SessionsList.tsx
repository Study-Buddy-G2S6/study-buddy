'use client';

import { useState } from 'react';
import { Col, Container, Row, Badge, Form, InputGroup } from 'react-bootstrap';
import Link from 'next/link';
import { Session, User, Course } from '@prisma/client';
import { Search } from 'react-bootstrap-icons';
import SessionCard from '@/components/AllUsersSessionCard';

type SessionWithRelations = Session & {
  user: User;
  course: Course;
};

interface SessionsListProps {
  sessions: SessionWithRelations[];
  currentUserEmail: string;
}

const SessionsList = ({ sessions, currentUserEmail }: SessionsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const hasMySessions = sessions.some((session) => session.owner === currentUserEmail);

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const searchableText = [
      session.name,
      session.course.courseName,
      session.course.courseTitle,
      session.location,
      session.description || '',
      session.owner,
      session.user.userName || '',
    ].join(' ').toLowerCase();

    return searchableText.includes(query);
  });

  // Sort by closest upcoming start date to now
  const now = Date.now();
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const aTime = new Date(a.startDate).getTime();
    const bTime = new Date(b.startDate).getTime();
    // Earlier (closer to now) first; fallback to original order when invalid
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    const diffA = Math.abs(aTime - now);
    const diffB = Math.abs(bTime - now);
    return diffA - diffB;
  });

  return (
    <main>
      <Container id="study-sessions" fluid className="py-3">
        <Row>
          <Col>
            <h1 className="text-center mb-4">All Study Sessions</h1>
            <p className="text-center text-muted mb-3">
              Browse and join study sessions created by students
            </p>

            {/* Search Bar */}
            <Row className="justify-content-center mb-4">
              <Col xs={12} md={8} lg={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <Search />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by session name, course, location, or creator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shadow-sm"
                  />
                </InputGroup>
                {searchQuery && (
                  <small className="text-muted">
                    {`Found ${filteredSessions.length} session${filteredSessions.length !== 1 ? 's' : ''}`}
                  </small>
                )}
              </Col>
            </Row>

            {/* "My Session" link displayed above all cards when user has sessions */}
            {hasMySessions && (
              <Row className="mb-4">
                <Col className="d-flex justify-content-center">
                  <Link href="/session/my-sessions" className="text-decoration-none">
                    <Badge bg="primary" className="px-3 py-2">My Sessions</Badge>
                  </Link>
                </Col>
              </Row>
            )}

            {/* Sessions Display */}
            {sortedSessions.length === 0 ? (
              <p className="text-center">
                {searchQuery
                  ? 'No sessions match your search. Try different keywords.'
                  : 'No study sessions available. Create one to get started!'}
              </p>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {sortedSessions.map((session) => (
                  <Col key={session.id}>
                    <SessionCard
                      session={session}
                      user={session.user as User}
                      course={session.course as Course}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SessionsList;
