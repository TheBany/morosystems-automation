import { Page, Locator, expect } from '@playwright/test';

export class MoroSystemsPage {
  readonly page: Page;
  readonly cookiesAcceptButton: Locator;
  readonly hamburgerButton: Locator;
  readonly oNasMenuItem: Locator;

  // Breakpoints based on MoroSystems' responsive design
  private readonly DESKTOP_LARGE_BREAKPOINT = 1480;
  private readonly DESKTOP_SMALL_BREAKPOINT = 1000;

  private cookiesAccepted = false;

  constructor(page: Page) {
    this.page = page;
    this.cookiesAcceptButton = page.getByRole('button', { name: /přijmout vše/i });
    this.hamburgerButton = page.locator('.m-main__burger');
    this.oNasMenuItem = page.locator('li.item-about');
  }


  async acceptCookiesIfPresent() {
    if (this.cookiesAccepted) {
      return;
    }

    try {
      await this.cookiesAcceptButton.waitFor({ state: 'visible', timeout: 8000 });
      await this.cookiesAcceptButton.click();
      this.cookiesAccepted = true;
    } catch {
      // Banner didn't appear within timeout
    }
  }

  async goToKariera() {
    const viewportWidth = this.page.viewportSize()?.width ?? 0;

    if (viewportWidth >= this.DESKTOP_LARGE_BREAKPOINT) {
      // Career is directly visible in the header menu — just click
      await this.getVisibleKarieraLink().click();
    } else if (viewportWidth >= this.DESKTOP_SMALL_BREAKPOINT) {
      // Career is under "About Us" — hover first, then click
      await this.oNasMenuItem.hover();
      await this.getVisibleKarieraLink().click();
    } else {
      // Mobile viewport — Career is inside the hamburger menu
      await this.hamburgerButton.click();
      await this.getVisibleKarieraLink().click();
    }

    await expect(this.page).toHaveURL(/.*\/kariera\/?$/);

    // Cookie banner may appear late — after navigation to Kariera
    await this.acceptCookiesIfPresent();
  }

  private getVisibleKarieraLink(): Locator {
    return this.page
      .getByRole('banner')
      .getByRole('link', { name: 'Kariéra', exact: true })
      .locator('visible=true');
  }
}