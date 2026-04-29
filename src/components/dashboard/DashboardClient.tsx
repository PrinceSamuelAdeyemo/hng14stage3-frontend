'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';
import {
  clearSession,
  createId,
  getHabits,
  getSession,
  saveHabits,
  todayIsoDate
} from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import { validateHabitName } from '@/lib/validators';
import type { Session } from '@/types/auth';
import type { Habit } from '@/types/habit';

type HabitFormState = {
  id: string | null;
  name: string;
  description: string;
};

const emptyForm: HabitFormState = {
  id: null,
  name: '',
  description: ''
};

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [form, setForm] = useState<HabitFormState>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const today = useMemo(() => todayIsoDate(), []);

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.replace('/login');
      return;
    }

    setSession(activeSession);
    setHabits(getHabits().filter((habit) => habit.userId === activeSession.userId));
  }, [router]);

  function persistForCurrentUser(nextUserHabits: Habit[]) {
    if (!session) {
      return;
    }

    const otherHabits = getHabits().filter((habit) => habit.userId !== session.userId);
    saveHabits([...otherHabits, ...nextUserHabits]);
    setHabits(nextUserHabits);
  }

  function openCreateForm() {
    setForm(emptyForm);
    setError(null);
    setIsFormOpen(true);
  }

  function openEditForm(habit: Habit) {
    setForm({ id: habit.id, name: habit.name, description: habit.description });
    setError(null);
    setIsFormOpen(true);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      return;
    }

    const validation = validateHabitName(form.name);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (form.id) {
      const nextHabits = habits.map((habit) =>
        habit.id === form.id
          ? {
              ...habit,
              name: validation.value,
              description: form.description.trim(),
              frequency: 'daily' as const
            }
          : habit
      );
      persistForCurrentUser(nextHabits);
    } else {
      const habit: Habit = {
        id: createId('habit'),
        userId: session.userId,
        name: validation.value,
        description: form.description.trim(),
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: []
      };
      persistForCurrentUser([...habits, habit]);
    }

    setForm(emptyForm);
    setError(null);
    setIsFormOpen(false);
  }

  function handleDelete(habitId: string) {
    persistForCurrentUser(habits.filter((habit) => habit.id !== habitId));
    setPendingDeleteId(null);
  }

  function handleToggle(habitId: string) {
    persistForCurrentUser(
      habits.map((habit) => (habit.id === habitId ? toggleHabitCompletion(habit, today) : habit))
    );
  }

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-fuchsia-50 px-4">
        <p className="text-sm font-medium text-slate-700">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main data-testid="dashboard-page" className="min-h-screen bg-fuchsia-50 px-4 py-5 sm:px-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-800">Habit Tracker</p>
            <h1 className="text-2xl font-bold text-slate-950">Today</h1>
            <p className="text-sm text-slate-600">{session.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="create-habit-button"
              type="button"
              onClick={openCreateForm}
              className="rounded-md bg-cyan-800 px-4 py-2 text-sm font-semibold text-white"
            >
              Create habit
            </button>
            <button
              data-testid="auth-logout-button"
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800"
            >
              Log out
            </button>
          </div>
        </header>

        {isFormOpen ? (
          <form
            data-testid="habit-form"
            onSubmit={handleSave}
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            <label className="text-sm font-medium text-slate-800" htmlFor="habit-name">
              Habit name
              <input
                id="habit-name"
                data-testid="habit-name-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-800" htmlFor="habit-description">
              Description
              <textarea
                id="habit-description"
                data-testid="habit-description-input"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-800" htmlFor="habit-frequency">
              Frequency
              <select
                id="habit-frequency"
                data-testid="habit-frequency-select"
                value="daily"
                disabled
                className="mt-2 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-3"
              >
                <option value="daily">Daily</option>
              </select>
            </label>
            <button
              data-testid="habit-save-button"
              type="submit"
              className="rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white"
            >
              Save habit
            </button>
          </form>
        ) : null}

        {habits.length === 0 ? (
          <section
            data-testid="empty-state"
            className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-700"
          >
            <h2 className="text-lg font-semibold text-slate-950">No habits yet</h2>
            <p className="mt-2 text-sm">Create your first daily habit to start a streak.</p>
          </section>
        ) : (
          <section className="grid gap-3">
            {habits.map((habit) => {
              const slug = getHabitSlug(habit.name);
              const completedToday = habit.completions.includes(today);
              const streak = calculateCurrentStreak(habit.completions, today);

              return (
                <article
                  key={habit.id}
                  data-testid={`habit-card-${slug}`}
                  className={`rounded-lg border p-4 shadow-sm ${
                    completedToday
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">{habit.name}</h2>
                      {habit.description ? (
                        <p className="mt-1 text-sm text-slate-700">{habit.description}</p>
                      ) : null}
                      <p
                        data-testid={`habit-streak-${slug}`}
                        className="mt-2 text-sm font-semibold text-cyan-900"
                      >
                        Current streak: {streak}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        data-testid={`habit-complete-${slug}`}
                        type="button"
                        onClick={() => handleToggle(habit.id)}
                        className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        {completedToday ? 'Unmark today' : 'Complete today'}
                      </button>
                      <button
                        data-testid={`habit-edit-${slug}`}
                        type="button"
                        onClick={() => openEditForm(habit)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        data-testid={`habit-delete-${slug}`}
                        type="button"
                        onClick={() => setPendingDeleteId(habit.id)}
                        className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {pendingDeleteId === habit.id ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md bg-red-50 p-3">
                      <p className="text-sm font-medium text-red-800">Delete this habit?</p>
                      <button
                        data-testid="confirm-delete-button"
                        type="button"
                        onClick={() => handleDelete(habit.id)}
                        className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Confirm delete
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
