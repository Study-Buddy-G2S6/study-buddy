'use client';

/* eslint-disable react/require-default-props */

import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

type Props = {
  uhError?: boolean;
};

export default function SignInButtonsClient({ uhError = false }: Props) {
  return (
    <>
      <Row>
        <Col className="d-flex justify-content-center align-items-center mb-3">
          <Button
            variant="primary"
            className="btn me-2"
            title="Sign in with UH Account"
            onClick={() => signIn()}
          >
            Sign in
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center align-items-center mb-3">
          <Button
            variant="light"
            className="btn btn-google d-flex align-items-center"
            title="Log in through Google"
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
            Log in with Google
          </Button>
        </Col>
      </Row>

      {!uhError && (
        <Row>
          <div className="small text-muted mt-2 mt-sm-0">
            By logging in you agree to your university account policies.
          </div>
        </Row>
      )}
    </>
  );
}
