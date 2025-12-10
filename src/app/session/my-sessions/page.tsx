import { getServerSession } from 'next-auth';
import { Col, Container, Row } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import { User, Course } from '@prisma/client';
import SessionCard from '@/components/SessionCard';

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

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Row>
          <Col>
            <h1 className="text-center">
              {user?.userName || 'My'}
              &apos;s Sessions
            </h1>
            <Row xs={1} md={2} lg={3} className="g-4">
              {sessions.map((session) => (
                <Col key={session.id}>
                  <SessionCard
                    session={session}
                    user={session.user as User}
                    course={session.course as Course}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ListPage;
