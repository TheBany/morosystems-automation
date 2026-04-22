import { test, expect } from '@playwright/test';
import { MoroSystemsPage } from '../../pages/MoroSystemsPage';

test.describe('MoroSystems visual regression', () => {
  let morosystems: MoroSystemsPage;

  test.beforeEach(async ({ page }) => {
    morosystems = new MoroSystemsPage(page);
    await page.goto('https://www.morosystems.cz/');
    await morosystems.acceptCookiesIfPresent();
  });

  test('homepage matches baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png', { fullPage: true });
  });

  test('kariera page matches baseline', async ({ page }) => {
    await morosystems.goToKariera();
    await expect(page).toHaveScreenshot('kariera.png', { fullPage: true });
  });
});