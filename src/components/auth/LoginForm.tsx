'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsers, saveSession } from '@/lib/storage';
import { AuthShell } from './AuthShell';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const user = getUsers().find(
      (candidate) => candidate.email === normalizedEmail && candidate.password === password
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    saveSession({ userId: user.id, email: user.email });
    router.push('/dashboard');
  }

  return (
    <AuthShell
      title="Log in"
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-cyan-800">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <label className="block text-sm font-medium text-slate-800" htmlFor="login-email">
          Email
          <input
            id="login-email"
            data-testid="auth-login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
          />
        </label>
        <label className="block text-sm font-medium text-slate-800" htmlFor="login-password">
          Password
          <input
            id="login-password"
            data-testid="auth-login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
          />
        </label>
        <button
          data-testid="auth-login-submit"
          type="submit"
          className="w-full rounded-md bg-cyan-800 px-4 py-3 font-semibold text-white"
        >
          Log in
        </button>
      </form>
    </AuthShell>
  );
}
