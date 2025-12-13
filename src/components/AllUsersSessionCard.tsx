'use client';

import { Session, User, Course } from '@prisma/client';
import { Card } from 'react-bootstrap';

const AllUsersSessionCard = ({ session, course, user }: { session: Session; course: Course; user: User }) => (
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
  </Card>
);

export default AllUsersSessionCard;
