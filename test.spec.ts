import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3002/coding');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.locator('div').filter({ hasText: '$ hyperion swarm start --' }).nth(4).click();
  await page.locator('div').filter({ hasText: '$ hyperion swarm start --' }).nth(4).click();
  await page.locator('div').filter({ hasText: '$ hyperion swarm start --' }).nth(4).click();
  await page.locator('div').filter({ hasText: '$ hyperion swarm start --' }).nth(4).click();
});