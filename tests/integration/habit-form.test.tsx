import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { HABITS_KEY, SESSION_KEY } from '@/lib/storage';
import type { Habit } from '@/types/habit';

const session = { userId: 'user-1', email: 'person@example.com' };

function seedDashboard(habits: Habit[] = []) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  render(<DashboardClient />);
}

describe('habit form', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a validation error when habit name is empty', async () => {
    seedDashboard();

    await screen.findByTestId('dashboard-page');
    await userEvent.click(screen.getByTestId('create-habit-button'));
    await userEvent.click(screen.getByTestId('habit-save-button'));

    expect(screen.getByText('Habit name is required')).toBeInTheDocument();
  });

  it('creates a new habit and renders it in the list', async () => {
    seedDashboard();

    await screen.findByTestId('dashboard-page');
    await userEvent.click(screen.getByTestId('create-habit-button'));
    await userEvent.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await userEvent.type(screen.getByTestId('habit-description-input'), 'Eight glasses');
    await userEvent.click(screen.getByTestId('habit-save-button'));

    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(HABITS_KEY) ?? '[]')[0]).toMatchObject({
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Eight glasses',
      frequency: 'daily'
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const habit: Habit = {
      id: 'habit-1',
      userId: 'user-1',
      name: 'Drink Water',
      description: 'Eight glasses',
      frequency: 'daily',
      createdAt: '2026-04-29T00:00:00.000Z',
      completions: ['2026-04-29']
    };
    seedDashboard([habit]);

    await screen.findByTestId('habit-card-drink-water');
    await userEvent.click(screen.getByTestId('habit-edit-drink-water'));
    await userEvent.clear(screen.getByTestId('habit-name-input'));
    await userEvent.type(screen.getByTestId('habit-name-input'), 'Read Books');
    await userEvent.click(screen.getByTestId('habit-save-button'));

    const savedHabit = JSON.parse(localStorage.getItem(HABITS_KEY) ?? '[]')[0];
    expect(savedHabit).toMatchObject({
      id: 'habit-1',
      userId: 'user-1',
      name: 'Read Books',
      createdAt: '2026-04-29T00:00:00.000Z',
      completions: ['2026-04-29']
    });
  });

  it('deletes a habit only after explicit confirmation', async () => {
    seedDashboard([
      {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: '2026-04-29T00:00:00.000Z',
        completions: []
      }
    ]);

    await screen.findByTestId('habit-card-drink-water');
    await userEvent.click(screen.getByTestId('habit-delete-drink-water'));
    expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => expect(screen.queryByTestId('habit-card-drink-water')).not.toBeInTheDocument());
  });

  it('toggles completion and updates the streak display', async () => {
    seedDashboard([
      {
        id: 'habit-1',
        userId: 'user-1',
        name: 'Drink Water',
        description: '',
        frequency: 'daily',
        createdAt: '2026-04-29T00:00:00.000Z',
        completions: []
      }
    ]);

    await screen.findByTestId('habit-card-drink-water');
    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 0');
    await userEvent.click(screen.getByTestId('habit-complete-drink-water'));

    expect(screen.getByTestId('habit-streak-drink-water')).toHaveTextContent('Current streak: 1');
  });
});
