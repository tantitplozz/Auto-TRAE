import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
});

test('dashboard page has dashboard heading', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expects page to have a heading with the name of Dashboard.
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
