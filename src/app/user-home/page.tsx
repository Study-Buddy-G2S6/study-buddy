'use client';

import React from 'react';
import { Container, Card } from 'react-bootstrap';

const UserHome: React.FC = () => (
  <main>
    <Container className="py-5">
      <Card>
        <Card.Body>
          <h1 className="text-center">User Home</h1>
          <p className="text-center">Welcome — this is the user home page.</p>
        </Card.Body>
      </Card>
    </Container>
  </main>
);

export default UserHome;
