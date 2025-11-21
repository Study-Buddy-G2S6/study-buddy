'use client';

import React, { useEffect } from 'react';

const AboutPage: React.FC = () => {
  useEffect(() => {
    window.location.href = 'https://study-buddy-g2s6.github.io';
  }, []);

  return (
    <main>
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>Redirecting…</h1>
        <p>
          You are being redirected to the external About page. If you are not
          redirected automatically,
          <a href="https://study-buddy-g2s6.github.io" target="_blank" rel="noopener noreferrer">
            click here
          </a>
          .
        </p>
      </div>
    </main>
  );
};

export default AboutPage;
