/* eslint-disable react/require-default-props */
import React from 'react';
import Image from 'next/image';
import SignInButtons from '@/components/SignInButtonsClient';

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function Home({ searchParams = {} }: Props) {
  const uhError = (searchParams as Record<string, unknown>)?.uh_error === '1';

  return (
    <div className="site">
      <main className="hero">
        <div className="container d-flex justify-content-center align-items-center py-5">
          <div
            className="card p-4"
            role="region"
            aria-labelledby="main-heading"
            style={{ maxWidth: 720, width: '100%' }}
          >
            <div className="card-body text-center">
              <div className="row">
                <div className="col d-flex justify-content-center align-items-center mb-3">
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
                </div>
              </div>

              {!uhError ? (
                <>
                  <h1 style={{ color: '#0b5f3d' }}>
                    University of Hawai&apos;i at Manoa — Study Buddy
                  </h1>
                  <p className="lead">
                    Connect with peers, organize study sessions, and find help for
                    ICS courses.
                  </p>

                  <SignInButtons uhError={uhError} />
                </>
              ) : (
                <>
                  <h1 style={{ color: '#b02a37' }}>UH Email Required</h1>
                  <p className="lead">
                    Please sign in using your University of Hawaiʻi email (ending
                    with @hawaii.edu).
                  </p>

                  <SignInButtons uhError={uhError} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
