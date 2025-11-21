'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Signup has been disabled. Redirect users to the sign-in page.
 */
const SignUp = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  return (
    <main>
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>Sign Up Disabled</h1>
        <p>Account self-registration has been disabled. Please sign in with your university account.</p>
        <a href="/auth/signin">Go to Sign In</a>
      </div>
    </main>
  );
};

export default SignUp;
