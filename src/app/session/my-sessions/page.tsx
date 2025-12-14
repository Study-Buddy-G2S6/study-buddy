import { getServerSession } from 'next-auth';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import MySessionsListClient from '@/components/MySessionsListClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/** Render a list of items for the logged in user. */
const ListPage = async () => {
  // Protect the page, only logged in users can access it.
  const userSession = await getServerSession(authOptions);
  loggedInProtectedPage(
    userSession as {
      user: { email: string; id: string; randomKey: string };
      // eslint-disable-next-line @typescript-eslint/comma-dangle
    } | null,
  );

  const owner = (userSession && userSession.user && userSession.user.email) || '';
  const sessions = await prisma.session.findMany({
    where: {
      owner,
    },
    include: {
      course: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const user = await prisma.user.findUnique({
    where: { email: owner },
  });

  console.log('sessions', sessions);
  const hasSessions = sessions.length > 0;

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Row>
          <Col>
            <h1 className="text-center">
              {user?.userName || 'My'}
              &apos;s Sessions
            </h1>
            {hasSessions ? (
              <>
                <Row>
                  <Button href="/calendar" className="mb-3 d-inline-block" variant="link">
                    View My Sessions on the Calendar
                  </Button>
                </Row>
                <MySessionsListClient sessions={sessions as any} />
              </>
            ) : (
              <Row className="text-center mt-4">
                <Col>
                  <p className="text-muted mb-3">You currently have no sessions. Would you like to create a session?</p>
                  <Button href="/session/add" variant="primary">
                    Create a Session
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ListPage;
