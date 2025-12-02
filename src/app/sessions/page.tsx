'use client';

import { useSession } from 'next-auth/react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { Search, Calendar3, Clock, PersonFill, BookFill } from 'react-bootstrap-icons';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import { getSessions } from '@/lib/dbActions';

type SessionType = {
  id: number;
  name: string;
  description: string;
  course: string;
  courseTitle: string;
  startDate: string;
  endDate: string;
  owner: string;
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const SessionCard = ({ session, isOwner }: { session: SessionType; isOwner: boolean }) => (
  <Card className="mb-3 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h5 className="mb-1">{session.name}</h5>
          <div className="text-muted small">
            <BookFill className="me-1" />
            <strong>{session.course}</strong>
            {' '}
            -
            {' '}
            {session.courseTitle}
          </div>
        </div>
        {isOwner && (
          <Badge bg="success">My Session</Badge>
        )}
      </div>

      <p className="text-muted mb-2">{session.description}</p>

      <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
        <div>
          <Calendar3 className="me-1" />
          {formatDateTime(session.startDate)}
        </div>
        <div>
          <Clock className="me-1" />
          {formatDateTime(session.endDate)}
        </div>
        <div>
          <PersonFill className="me-1" />
          {session.owner}
        </div>
      </div>

      <div className="d-flex gap-2">
        <Button variant="primary" size="sm">
          View Details
        </Button>
        {isOwner && (
          <Button variant="outline-secondary" size="sm">
            Edit
          </Button>
        )}
      </div>
    </Card.Body>
  </Card>
);

const SessionsPage = () => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await getSessions();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSessions();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  const currentUser = session?.user?.email || '';
  const mySessions = sessions.filter(s => s.owner === currentUser);
  const allSessions = sessions;

  const filterSessions = (sessionList: SessionType[]) => {
    if (!searchQuery) return sessionList;
    const query = searchQuery.toLowerCase();
    return sessionList.filter(s => (
      s.name.toLowerCase().includes(query)
      || s.description.toLowerCase().includes(query)
      || s.course.toLowerCase().includes(query)
      || s.courseTitle.toLowerCase().includes(query)
    ));
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Study Sessions</h1>
            <Link href="/create-session">
              <Button variant="success">Create New Session</Button>
            </Link>
          </div>

          <InputGroup className="mb-3">
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search sessions by name, course, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'all')}
        className="mb-4"
      >
        <Tab eventKey="all" title={`All Sessions (${filterSessions(allSessions).length})`}>
          <Row>
            <Col lg={12}>
              {filterSessions(allSessions).length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <p className="text-muted mb-0">No sessions found</p>
                  </Card.Body>
                </Card>
              ) : (
                filterSessions(allSessions).map(s => (
                  <SessionCard key={s.id} session={s} isOwner={s.owner === currentUser} />
                ))
              )}
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="my" title={`My Sessions (${filterSessions(mySessions).length})`}>
          <Row>
            <Col lg={12}>
              {filterSessions(mySessions).length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <p className="text-muted mb-3">You haven&apos;t created any sessions yet</p>
                    <Link href="/create-session">
                      <Button variant="primary">Create Your First Session</Button>
                    </Link>
                  </Card.Body>
                </Card>
              ) : (
                filterSessions(mySessions).map(s => (
                  <SessionCard key={s.id} session={s} isOwner />
                ))
              )}
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default SessionsPage;
