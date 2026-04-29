function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function previousCalendarDate(date: string): string {
  const parsed = toUtcDate(date);
  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return parsed.toISOString().slice(0, 10);
}

export function calculateCurrentStreak(completions: string[], today?: string): number {
  const currentDay = today ?? new Date().toISOString().slice(0, 10);
  const completedDates = new Set([...new Set(completions)].sort());

  if (!completedDates.has(currentDay)) {
    return 0;
  }

  let streak = 0;
  let cursor = currentDay;

  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = previousCalendarDate(cursor);
  }

  return streak;
}
