'use client';

import React from 'react';
import Image from 'next/image';
import { Container } from 'react-bootstrap';

const UHLogoPage: React.FC = () => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
    <Container className="d-flex justify-content-center">
      <div style={{ textAlign: 'center' }}>
        <div className="uh-logo-container">
          <Image
            src="/uhlogo.png"
            width={160}
            height={160}
            alt="University of Hawaiʻi Mānoa - Study Buddy"
            className="uh-logo-img"
          />
        </div>
        <h2 style={{ marginTop: '1rem', color: '#0b5f3d' }}>
          University of Hawaiʻi Mānoa — Study Buddy
        </h2>
      </div>
    </Container>
  </div>
);

export default UHLogoPage;
