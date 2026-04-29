import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { SESSION_KEY, USERS_KEY } from '@/lib/storage';

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits the signup form and creates a session', async () => {
    render(<SignupForm />);

    await userEvent.type(screen.getByTestId('auth-signup-email'), 'person@example.com');
    await userEvent.type(screen.getByTestId('auth-signup-password'), 'password');
    await userEvent.click(screen.getByTestId('auth-signup-submit'));

    expect(JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')).toMatchObject({
      email: 'person@example.com'
    });
  });

  it('shows an error for duplicate signup email', async () => {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'password',
          createdAt: '2026-04-29T00:00:00.000Z'
        }
      ])
    );
    render(<SignupForm />);

    await userEvent.type(screen.getByTestId('auth-signup-email'), 'person@example.com');
    await userEvent.type(screen.getByTestId('auth-signup-password'), 'password');
    await userEvent.click(screen.getByTestId('auth-signup-submit'));

    expect(screen.getByText('User already exists')).toBeInTheDocument();
  });

  it('submits the login form and stores the active session', async () => {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([
        {
          id: 'user-1',
          email: 'person@example.com',
          password: 'password',
          createdAt: '2026-04-29T00:00:00.000Z'
        }
      ])
    );
    render(<LoginForm />);

    await userEvent.type(screen.getByTestId('auth-login-email'), 'person@example.com');
    await userEvent.type(screen.getByTestId('auth-login-password'), 'password');
    await userEvent.click(screen.getByTestId('auth-login-submit'));

    expect(JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')).toEqual({
      userId: 'user-1',
      email: 'person@example.com'
    });
  });

  it('shows an error for invalid login credentials', async () => {
    render(<LoginForm />);

    await userEvent.type(screen.getByTestId('auth-login-email'), 'person@example.com');
    await userEvent.type(screen.getByTestId('auth-login-password'), 'wrong');
    await userEvent.click(screen.getByTestId('auth-login-submit'));

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });
});
