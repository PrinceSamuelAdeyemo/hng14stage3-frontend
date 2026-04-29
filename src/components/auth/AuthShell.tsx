import type { ReactNode } from 'react';
import Link from 'next/link';

type AuthShellProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fuchsia-50 px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-cyan-800">
          Habit Tracker
        </Link>
        <h1 className="mb-5 text-2xl font-bold text-slate-950">{title}</h1>
        {children}
        <div className="mt-6 text-sm text-slate-700">{footer}</div>
      </section>
    </main>
  );
}
