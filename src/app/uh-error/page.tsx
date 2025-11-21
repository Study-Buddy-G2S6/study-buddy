'use client';

/* eslint-disable react/jsx-one-expression-per-line */

import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

const UHErrorPage: React.FC = () => (
  <main>
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center p-4">
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 120, height: 120 }}>
                <Image src="/uhlogo.png" width={120} height={120} alt="UH logo" />
              </div>
            </div>
            <h2 className="mt-3" style={{ color: '#0b5f3d' }}>
              UH Email Required
            </h2>
            <p>
              Please sign in using your University of Hawaiʻi email (ending with
            </p>
            <p>
              <strong>@hawaii.edu</strong>.
            </p>
            <div className="d-flex justify-content-center">
              <Button variant="light" onClick={() => signIn('google')}>
                <Image src="/google-logo.svg" width={18} height={18} alt="" />
                <span className="ms-2">Sign in with Google</span>
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  </main>
);

export default UHErrorPage;
