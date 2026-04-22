import { Page, Locator, expect } from '@playwright/test';

export class GooglePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to Google search results page for "MoroSystems".
   * In tests, this request is intercepted by mockGoogleSearch fixture.
   */
  async goto() {
    await this.page.goto('https://www.google.com/search?q=MoroSystems');
  }

  async expectResultContainsLink(url: string) {
    await expect(this.getResultLink(url).first()).toBeVisible();
  }

  async clickResultLink(url: string) {
    await this.getResultLink(url).first().click();
  }

  private getResultLink(url: string): Locator {
    return this.page.locator(`[data-testid="search-result-link"][href*="${url}"]`);
  }
}