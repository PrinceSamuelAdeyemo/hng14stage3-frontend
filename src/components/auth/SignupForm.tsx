'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createId, getUsers, saveSession, saveUsers } from '@/lib/storage';
import { AuthShell } from './AuthShell';

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      setError('User already exists');
      return;
    }

    const user = {
      id: createId('user'),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString()
    };

    saveUsers([...users, user]);
    saveSession({ userId: user.id, email: user.email });
    router.push('/dashboard');
  }

  return (
    <AuthShell
      title="Sign up"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cyan-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <label className="block text-sm font-medium text-slate-800" htmlFor="signup-email">
          Email
          <input
            id="signup-email"
            data-testid="auth-signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
          />
        </label>
        <label className="block text-sm font-medium text-slate-800" htmlFor="signup-password">
          Password
          <input
            id="signup-password"
            data-testid="auth-signup-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
          />
        </label>
        <button
          data-testid="auth-signup-submit"
          type="submit"
          className="w-full rounded-md bg-cyan-800 px-4 py-3 font-semibold text-white"
        >
          Sign up
        </button>
      </form>
    </AuthShell>
  );
}
