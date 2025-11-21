'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const Home = () => {
  const params = useSearchParams();
  const uhError = params?.get('uh_error') === '1';

  return (
    <div className="site">
      <main className="hero">
        <Container className="d-flex justify-content-center align-items-center py-5">
          <Card
            className="card p-4"
            role="region"
            aria-labelledby="main-heading"
            style={{ maxWidth: 720, width: '100%' }}
          >
            <Card.Body className="text-center">
              <Row>
                <Col className="d-flex justify-content-center align-items-center mb-3">
                  <a href="/uh-logo" title="University of Hawaiʻi logo">
                    <div className="uh-logo-container">
                      <Image
                        src="/uhlogo.png"
                        width={120}
                        height={120}
                        alt="University of Hawaiʻi Mānoa - Study Buddy"
                        className="uh-logo-img"
                      />
                    </div>
                  </a>
                </Col>
              </Row>

              {!uhError ? (
                <>
                  <h1 style={{ color: '#0b5f3d' }}>
                    University of Hawai&apos;i at Manoa — Study Buddy
                  </h1>
                  <p className="lead">
                    Connect with peers, organize study sessions, and find help for
                    ICS courses.
                  </p>

                  {/* Primary login button removed per request; keep Google login button below */}
                  <Row>
                    <Col className="d-flex justify-content-center align-items-center mb-3">
                      <Button
                        variant="light"
                        className="btn btn-google d-flex align-items-center"
                        title="Sign in with Google"
                        onClick={() => signIn('google')}
                      >
                        <Image
                          src="/google-logo.svg"
                          width={18}
                          height={18}
                          alt=""
                          aria-hidden="true"
                          className="me-2"
                        />
                        Login with Google
                      </Button>
                    </Col>
                  </Row>

                  <Row>
                    <div className="small text-muted mt-2 mt-sm-0">
                      By logging in you agree to your university account policies.
                    </div>
                  </Row>
                </>
              ) : (
                <>
                  <h1 style={{ color: '#b02a37' }}>UH Email Required</h1>
                  <p className="lead">
                    Please sign in using your University of Hawaiʻi email (ending
                    with @hawaii.edu).
                  </p>

                  <Row>
                    <Col className="d-flex justify-content-center align-items-center mb-3">
                      <Button
                        variant="light"
                        className="btn btn-google d-flex align-items-center"
                        title="Sign in with Google"
                        onClick={() => signIn('google')}
                      >
                        <Image
                          src="/google-logo.svg"
                          width={18}
                          height={18}
                          alt=""
                          aria-hidden="true"
                          className="me-2"
                        />
                        Sign in with Google
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Card.Body>
          </Card>
        </Container>
      </main>
    </div>
  );
};

export default Home;
