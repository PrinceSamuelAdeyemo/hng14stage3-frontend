import type { Session, User } from '@/types/auth';
import type { Habit } from '@/types/habit';

export const USERS_KEY = 'habit-tracker-users';
export const SESSION_KEY = 'habit-tracker-session';
export const HABITS_KEY = 'habit-tracker-habits';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function getUsers(): User[] {
  return readJson<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeJson(USERS_KEY, users);
}

export function getSession(): Session | null {
  return readJson<Session | null>(SESSION_KEY, null);
}

export function saveSession(session: Session | null): void {
  writeJson(SESSION_KEY, session);
}

export function clearSession(): void {
  if (canUseStorage()) {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

export function getHabits(): Habit[] {
  return readJson<Habit[]>(HABITS_KEY, []);
}

export function saveHabits(habits: Habit[]): void {
  writeJson(HABITS_KEY, habits);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
