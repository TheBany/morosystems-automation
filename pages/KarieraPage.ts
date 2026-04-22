import { Page, Locator, expect } from '@playwright/test';

export class KarieraPage {
  readonly page: Page;
  readonly filterTrigger: Locator;
  readonly filterCurrentValue: Locator;
  readonly positionItems: Locator;
  readonly dropdownOpen: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterTrigger = page.locator('.inp-custom-select__select');
    this.filterCurrentValue = page.locator('.inp-custom-select__select-wrap');
    this.positionItems = page.locator('li.c-positions__item:visible');
    this.dropdownOpen = page.locator('.inp-custom-select.is-open');
  }

  async selectCity(city: string) {
    const option = this.page.locator(`label.inp-custom-select__item[data-filter="${city}"]`);

    // Right after arriving on the Kariera page the filter content
    // briefly re-renders. If Playwright happens to click the
    // trigger during that re-render, the click is lost and the dropdown
    // stays closed. Retry until the 'is-open' class appears on the
    // wrapper, which confirms the dropdown actually opened.
    await expect(async () => {
      await this.filterTrigger.click();
      await expect(this.dropdownOpen).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });

    await option.click();
  }

  /**
   * Verifies that the filter displays the selected city.
   */
  async expectFilterShowsCity(city: string) {
    await expect(this.filterCurrentValue).toHaveText(new RegExp(city, 'i'));
  }

  /**
   * Verifies that every visible position contains the selected city
   * in its `data-filter` attribute. Tolerates 0 results (no matches is valid).
   */
  async expectAllPositionsContainCity(city: string) {
    const count = await this.positionItems.count();

    for (let i = 0; i < count; i++) {
      const dataFilter = await this.positionItems.nth(i).getAttribute('data-filter');
      expect(dataFilter?.toLowerCase()).toContain(city.toLowerCase());
    }
  }
}