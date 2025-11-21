
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/dbActions';

const SignUp = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.endsWith('@hawaii.edu')) {
      setError('Email must end with @hawaii.edu');
      return;
    }
    setLoading(true);
    try {
      await createUser({ email, password });
      setSuccess('Account created! You can now sign in.');
      setEmail('');
      setPassword('');
      setTimeout(() => router.push('/auth/signin'), 1500);
    } catch (err: any) {
      setError('Could not create account. Email may already be registered.');
    }
    setLoading(false);
  };

  return (
    <main>
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: '2rem', background: '#222', borderRadius: 8 }}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="UH Email (@hawaii.edu)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: 4 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: 4 }}
          />
          <button type="submit" disabled={loading} style={{ padding: '0.5rem', borderRadius: 4, background: '#0b5f3d', color: '#fff' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'lightgreen', marginTop: '1rem' }}>{success}</div>}
      </div>
    </main>
  );
};

export default SignUp;
