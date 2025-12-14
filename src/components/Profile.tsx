'use client';

import React from 'react';
import { Container, Card, Row, Col, Image } from 'react-bootstrap';
import type { User, Course } from '@prisma/client';

const Profile = ({ user }: { user: User & { courses?: Course[] } }) => {
  const sortedCourses = [...(user.courses ?? [])].sort((a, b) => a.courseName.localeCompare(b.courseName));

  return (
    <main>
      <Container className="py-4">
        <Card>
          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} md={2} className="d-flex justify-content-center mb-3 mb-md-0">
                <Image
                  src={user.profileImage ?? '/default-profile.png'}
                  alt="avatar"
                  width={140}
                  height={140}
                  roundedCircle
                  style={{ objectFit: 'cover' }}
                />
              </Col>
              <Col>
                <h1 className="mb-0">{user.userName}</h1>
                <p className="mt-3">{user.description}</p>
              </Col>
            </Row>
            <section className="mt-4">
              <h2>Courses</h2>
              <Row className="g-3">
                {sortedCourses.length === 0 && <div className="text-muted">No courses found.</div>}
                {sortedCourses.map((c: Course) => (
                  <Col xs={12} md={6} key={c.id}>
                    <Card className="p-2">
                      <strong>{c.courseName}</strong>
                      <div className="text-muted">{c.courseTitle}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default Profile;
