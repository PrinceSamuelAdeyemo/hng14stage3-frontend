import { beforeEach, describe, expect, it } from 'vitest';
import {
  HABITS_KEY,
  SESSION_KEY,
  USERS_KEY,
  clearSession,
  createId,
  getHabits,
  getSession,
  getUsers,
  saveHabits,
  saveSession,
  saveUsers,
  todayIsoDate
} from '@/lib/storage';
import type { Habit } from '@/types/habit';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads fallback values when storage keys are missing or invalid', () => {
    localStorage.setItem(USERS_KEY, 'not-json');

    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
    expect(getHabits()).toEqual([]);
  });

  it('saves and reads users sessions and habits', () => {
    const habit: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Drink Water',
      description: '',
      frequency: 'daily',
      createdAt: '2026-04-29T00:00:00.000Z',
      completions: []
    };

    saveUsers([
      {
        id: 'user-1',
        email: 'person@example.com',
        password: 'password',
        createdAt: '2026-04-29T00:00:00.000Z'
      }
    ]);
    saveSession({ userId: 'user-1', email: 'person@example.com' });
    saveHabits([habit]);

    expect(getUsers()).toHaveLength(1);
    expect(getSession()).toEqual({ userId: 'user-1', email: 'person@example.com' });
    expect(getHabits()).toEqual([habit]);
    expect(localStorage.getItem(HABITS_KEY)).toContain('Drink Water');
  });

  it('stores null sessions and clears active sessions', () => {
    saveSession(null);
    expect(localStorage.getItem(SESSION_KEY)).toBe('null');

    saveSession({ userId: 'user-1', email: 'person@example.com' });
    clearSession();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('creates prefixed ids and returns an ISO calendar date', () => {
    expect(createId('habit')).toMatch(/^habit-/);
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
