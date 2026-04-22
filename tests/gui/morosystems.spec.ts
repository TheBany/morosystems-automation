import { test } from '@playwright/test';
import { GooglePage } from '../../pages/GooglePage';
import { MoroSystemsPage } from '../../pages/MoroSystemsPage';
import { KarieraPage } from '../../pages/KarieraPage';
import { mockGoogleSearch } from '../../fixtures/googleSearchMock';

const PREFERRED_CITY = 'home office';
const MOROSYSTEMS_URL = 'morosystems.cz';

test.describe('MoroSystems GUI', () => {
  test('search for MoroSystems, navigate to Kariera and filter positions', async ({ page }) => {
    const google = new GooglePage(page);
    const morosystems = new MoroSystemsPage(page);
    const kariera = new KarieraPage(page);

    await test.step('mock Google search results', async () => {
      await mockGoogleSearch(page, [
        { title: 'MoroSystems - užitečná IT řešení', url: 'https://www.morosystems.cz/' },
        { title: 'MoroSystems LinkedIn', url: 'https://www.linkedin.com/company/morosystems' },
      ]);
    });

    await test.step('search and validate results contain MoroSystems', async () => {
      await google.goto();
      await google.expectResultContainsLink(MOROSYSTEMS_URL);
    });

    await test.step('navigate to MoroSystems website', async () => {
      await google.clickResultLink(MOROSYSTEMS_URL);
      await morosystems.acceptCookiesIfPresent();
    });

    await test.step('navigate to Kariera page via site navigation', async () => {
      await morosystems.goToKariera();
    });

    await test.step('filter positions by preferred city', async () => {
      await kariera.selectCity(PREFERRED_CITY);
      await kariera.expectFilterShowsCity(PREFERRED_CITY);
      await kariera.expectAllPositionsContainCity(PREFERRED_CITY);
    });
  });
});