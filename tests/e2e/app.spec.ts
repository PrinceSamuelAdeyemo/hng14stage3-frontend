import { expect, test } from '@playwright/test';

const users = [
  {
    id: 'user-1',
    email: 'one@example.com',
    password: 'password',
    createdAt: '2026-04-29T00:00:00.000Z'
  },
  {
    id: 'user-2',
    email: 'two@example.com',
    password: 'password',
    createdAt: '2026-04-29T00:00:00.000Z'
  }
];

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId: 'user-1', email: 'one@example.com' })
      );
    });
    await page.goto('/');
    await expect(page.getByTestId('splash-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');
    await page.getByTestId('auth-signup-email').fill('new@example.com');
    await page.getByTestId('auth-signup-password').fill('password');
    await page.getByTestId('auth-signup-submit').click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test("logs in an existing user and loads only that user's habits", async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(({ seededUsers }) => {
      localStorage.setItem('habit-tracker-users', JSON.stringify(seededUsers));
      localStorage.setItem(
        'habit-tracker-habits',
        JSON.stringify([
          {
            id: 'habit-1',
            userId: 'user-1',
            name: 'Drink Water',
            description: '',
            frequency: 'daily',
            createdAt: '2026-04-29T00:00:00.000Z',
            completions: []
          },
          {
            id: 'habit-2',
            userId: 'user-2',
            name: 'Read Books',
            description: '',
            frequency: 'daily',
            createdAt: '2026-04-29T00:00:00.000Z',
            completions: []
          }
        ])
      );
    }, { seededUsers: users });

    await page.getByTestId('auth-login-email').fill('one@example.com');
    await page.getByTestId('auth-login-password').fill('password');
    await page.getByTestId('auth-login-submit').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
    await expect(page.getByTestId('habit-card-read-books')).toHaveCount(0);
  });

  test('creates a habit from the dashboard', async ({ page }) => {
    await signIn(page);
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();

    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await signIn(page);
    await createHabit(page, 'Drink Water');

    await page.getByTestId('habit-complete-drink-water').click();
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('Current streak: 1');
  });

  test('persists session and habits after page reload', async ({ page }) => {
    await signIn(page);
    await createHabit(page, 'Drink Water');

    await page.reload();
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  test('logs out and redirects to /login', async ({ page }) => {
    await signIn(page);
    await page.getByTestId('auth-logout-button').click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context
  }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload();

    await expect(page.locator('body')).toContainText(/Habit Tracker|Log in/);
  });
});

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(`user-${Date.now()}@example.com`);
  await page.getByTestId('auth-signup-password').fill('password');
  await page.getByTestId('auth-signup-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
}

async function createHabit(page: import('@playwright/test').Page, name: string) {
  await page.getByTestId('create-habit-button').click();
  await page.getByTestId('habit-name-input').fill(name);
  await page.getByTestId('habit-save-button').click();
  await expect(page.getByTestId(`habit-card-${name.toLowerCase().replace(/\s+/g, '-')}`)).toBeVisible();
}
