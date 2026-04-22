import { Page } from '@playwright/test';

export interface MockedSearchResult {
  title: string;
  url: string;
}

/**
 * Mocks Google search response by intercepting requests to google.com/search
 * and returning a programmatically generated results page.
 *
 * This avoids Google's anti-automation measures (reCAPTCHA) that would
 * otherwise make the test flaky and unreliable.
 *
 * @example
 * await mockGoogleSearch(page, [
 *   { title: 'MoroSystems', url: 'https://www.morosystems.cz/' },
 * ]);
 * await page.goto('https://www.google.com/search?q=MoroSystems');
 */
export async function mockGoogleSearch(page: Page, results: MockedSearchResult[]) {
  await page.route(/google\.com\/search/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=UTF-8',
      body: buildSearchResultsHtml(results),
    });
  });
}

/**
 * Builds minimal HTML mimicking a Google search results page.
 * Only includes what the test needs — result links with data-testid for stable selection.
 */
function buildSearchResultsHtml(results: MockedSearchResult[]): string {
  const resultBlocks = results
    .map(
      (result) => `
        <div class="search-result">
          <a href="${result.url}" data-testid="search-result-link">
            <h3>${result.title}</h3>
          </a>
        </div>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="cs">
      <head>
        <meta charset="UTF-8">
        <title>MoroSystems - Google Search</title>
      </head>
      <body>
        <div id="search-results">
          ${resultBlocks}
        </div>
      </body>
    </html>
  `;
}