import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

const routerMock = {
  push: vi.fn(),
  replace: vi.fn()
};

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));
