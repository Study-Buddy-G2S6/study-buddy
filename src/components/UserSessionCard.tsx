'use client';

import { Session, User, Course } from '@prisma/client';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { deleteSession } from '@/lib/dbActions';

const UserSessionCard = ({ session, course, user }: { session: Session; course: Course; user: User }) => (
  <Card className="w-100">
    <Card.Header>
      <Card.Title>
        {session.name}
      </Card.Title>
      <Card.Subtitle>
        {`${course?.courseName} - ${course?.courseTitle}`}
      </Card.Subtitle>
      <Card.Subtitle>
        {`Created By: ${user?.userName || session.owner}`}
      </Card.Subtitle>
    </Card.Header>
    <Card.Body>
      <Card.Text>
        {`Start Time: ${new Date(session.startDate).toLocaleString()}`}
      </Card.Text>
      <Card.Text>
        {`End Time: ${new Date(session.endDate).toLocaleString()}`}
      </Card.Text>
      <Card.Text>
        {`Location: ${session.location}`}
      </Card.Text>
      <Card.Text>
        {`Description: ${session.description}`}
      </Card.Text>
    </Card.Body>
    <Card.Footer>
      <Row>
        <Col xs="auto" className="me-auto">
          <Button type="button" href={`edit/${session.id}`}>Edit</Button>
        </Col>
        <Col xs="auto" className="ms-auto">
          <Button type="button" onClick={() => deleteSession(session.id)} variant="danger" className="ms-2">
            Delete
          </Button>
        </Col>
      </Row>
    </Card.Footer>
  </Card>
);

export default UserSessionCard;
