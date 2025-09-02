import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ConsentPage {
  readonly page: Page;

  // static locators
  readonly linkAltinn: Locator;
  readonly btnApprove: Locator;
  readonly btnReject: Locator;
  readonly btnFullmaktApprove: Locator;
  readonly btnFullmaktReject: Locator;

  constructor(page: Page) {
    this.page = page;

    this.linkAltinn = page.getByRole('link', { name: 'Altinn.no' });
    this.btnApprove = page.getByRole('button', { name: 'Ja, jeg gir samtykke' });
    this.btnReject = page.getByRole('button', { name: 'Nei, jeg gir ikke samtykke' });
    this.btnFullmaktApprove = page.getByRole('button', { name: 'Ja, jeg gir fullmakt' });
    this.btnFullmaktReject = page.getByRole('button', { name: 'Nei, jeg gir ikke fullmakt' });
  }

  // dynamic locators
  heading(name: string): Locator {
    return this.page.getByRole('heading', { name });
  }

  textContains(re: RegExp): Locator {
    return this.page.getByText(re);
  }

  // navigation
  async open(
    consentViewUri: string,
    fromPidLogin: (pid: string) => Promise<void>,
    fromPerson: string,
  ) {
    const url = consentViewUri + '&DONTCHOOSEREPORTEE=TRUE'; // tmp workaround
    await this.page.goto(url);
    await fromPidLogin(fromPerson);
  }

  // assertions
  async expectStandardIntro() {
    await expect(this.heading('Samtykke til bruk av dine data')).toBeVisible();
    await expect(this.textContains(/ønsker å hente opplysninger om deg/i)).toBeVisible();
    await expect(this.page.getByText('Playwright integrasjonstest')).toBeVisible();
    await expect(
      this.textContains(/Ved at du samtykker, får[\s\S]*tilgang til følgende opplysninger om deg/),
    ).toBeVisible();
  }

  async expectKravIntro() {
    await expect(this.heading('Godkjenne deling med banken')).toBeVisible();
    await expect(this.page.getByText('Playwright integrasjonstest')).toBeVisible();
    await expect(
      this.page.getByText(
        'Skatteetaten har utviklet en løsning for å dele informasjon med banker ',
      ),
    ).toBeVisible();
    await expect(this.page.getByText('Brukerstyrt tilgang')).toBeVisible();
    await expect(this.linkAltinn).toBeVisible();
  }

  async expectFullmaktIntro() {
    await expect(this.heading('Fullmakt til å handle på dine vegne')).toBeVisible();
    await expect(this.page.getByText('Playwright integrasjonstest')).toBeVisible();
    await expect(
      this.textContains(
        /Ved at du gir fullmakt, får[\s\S]*tilgang til følgende tjenester på dine vegne/,
      ),
    ).toBeVisible();
  }

  async expectEnkeltIntro() {
    await expect(this.textContains(/.* ber om ditt samtykke/)).toBeVisible();
    await expect(this.page.getByText('Playwright integrasjonstest')).toBeVisible();
    await expect(
      this.page.getByText('Ved å godkjenne denne forespørselen samtykker du til følgende:'),
    ).toBeVisible();
    await expect(this.page.getByText('Enkelt samtykke')).toBeVisible();
  }

  async expectExpiry(prefix: 'Samtykket er' | 'Fullmakten er', formattedOslo: string) {
    const re = new RegExp(`${prefix} tidsavgrenset og vil gå ut ${formattedOslo}`);
    await expect(this.textContains(re)).toBeVisible();
  }

  // actions
  async approveStandardAndWaitLogout() {
    await this.btnApprove.click();
    await this.waitForLogout();
  }

  async approveFullmaktAndWaitLogout() {
    await this.btnFullmaktApprove.click();
    await this.waitForLogout();
  }

  async rejectStandardAndWaitLogout() {
    await this.btnReject.click();
    await this.waitForLogout();
  }

  async waitForLogout(timeout = 15000) {
    const patterns = [/login\.test\.idporten\.no\/logout\/success/i, /example\.com/i];
    for (const re of patterns) {
      await this.page.waitForURL(re, { timeout });
    }
  }
}
