import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ConsentPage {
  readonly page: Page;

  // Links and buttons
  readonly linkAltinn: Locator;
  readonly buttonApprove: Locator;
  readonly buttonReject: Locator;
  readonly buttonFullmaktApprove: Locator;
  readonly buttonFullmaktReject: Locator;
  readonly languagePicker: Locator;
  readonly norwegian: Locator;

  // Headings
  readonly standardHeading: Locator;
  readonly headingKrav: Locator;
  readonly headingFullmakt: Locator;

  // Common labels/text blocks used across views
  readonly labelPlaywrightTest: Locator;

  // Standard intro text chunks
  readonly textStandardLead: Locator;
  readonly textStandardDetail: Locator;

  // Krav intro text chunks
  readonly textKravLead: Locator;
  readonly textUserAccess: Locator; // Brukerstyrt tilgang

  // Fullmakt intro text chunks
  readonly textFullmaktIntro: Locator;

  // Enkelt samtykke chunks
  readonly textEnkeltLead: Locator;
  readonly textEnkeltBulletIntro: Locator;
  readonly textEnkeltLabel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Controls/links
    this.languagePicker = page.getByRole('button', { name: /language/i });
    this.norwegian = page.locator('a', { hasText: 'Norsk (bokmål)' });
    this.linkAltinn = page.getByRole('link', { name: /altinn\.no/i });
    this.buttonApprove = page.getByRole('button', { name: /jeg gir samtykke/i });
    this.buttonReject = page.getByRole('button', { name: /jeg gir ikke samtykke/i });
    this.buttonFullmaktApprove = page.getByRole('button', { name: /jeg gir fullmakt/i });
    this.buttonFullmaktReject = page.getByRole('button', { name: /jeg gir ikke fullmakt/i });

    // Headings (use exact text when stable, regex when copy may drift)
    this.standardHeading = page.getByRole('heading', { name: /Samtykke til bruk av dine data/ });
    this.headingKrav = page.getByRole('heading', { name: /Godkjenne deling med banken/ });
    this.headingFullmakt = page.getByRole('heading', {
      name: /Fullmakt til å handle på dine vegne/,
    });

    // Common label
    this.labelPlaywrightTest = page.getByText(/Playwright integrasjonstest/i);

    // Standard intro text
    this.textStandardLead = page.getByText(/ønsker å hente opplysninger om deg/i);
    this.textStandardDetail = page.getByText(
      /Ved at du samtykker, får[\s\S]*tilgang til følgende opplysninger/i,
    );

    // Krav intro text
    this.textKravLead = page.getByText(/Skatteetaten har utviklet en løsning/i);
    this.textUserAccess = page.getByText(/Brukerstyrt tilgang/i);

    // Fullmakt intro text
    this.textFullmaktIntro = page.getByText(
      /Ved at du gir fullmakt, får[\s\S]*tilgang til følgende tjenester/i,
    );

    // Enkelt samtykke
    this.textEnkeltLead = page.getByText(/ber om ditt samtykke/i);
    this.textEnkeltBulletIntro = page.getByText(
      /Ved å godkjenne denne forespørselen samtykker du til følgende:/,
    );
    this.textEnkeltLabel = page.getByText(/Enkelt samtykke/);
  }

  // Dynamic helpers
  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name, exact: false });
  }

  textContains(re: RegExp): Locator {
    return this.page.getByText(re);
  }

  // Navigation
  async open(
    consentViewUri: string,
    fromPidLogin: (pid: string) => Promise<void>,
    fromPerson: string,
  ): Promise<void> {
    const url = new URL(consentViewUri);
    url.searchParams.set('DONTCHOOSEREPORTEE', 'TRUE'); // API workaround flag
    await this.page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
    await fromPidLogin(fromPerson);
  }

  // Expectations (use only POM locators)
  async expectStandardIntro(): Promise<void> {
    await expect(this.standardHeading).toBeVisible();
    await expect(this.textStandardLead).toBeVisible();
    await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textStandardDetail).toBeVisible();
  }

  async expectKravIntro(): Promise<void> {
    await expect(this.headingKrav).toBeVisible();
    await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textKravLead).toBeVisible();
    await expect(this.textUserAccess).toBeVisible();
    await expect(this.linkAltinn).toBeVisible();
  }

  async expectFullmaktIntro(): Promise<void> {
    await expect(this.headingFullmakt).toBeVisible();
    await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textFullmaktIntro).toBeVisible();
  }

  async expectEnkeltIntro(): Promise<void> {
    await expect(this.textEnkeltLead).toBeVisible();
    await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textEnkeltBulletIntro).toBeVisible();
    await expect(this.textEnkeltLabel).toBeVisible();
  }

  async expectExpiry(
    prefix: 'Samtykket er' | 'Fullmakten er',
    formattedOslo: string,
  ): Promise<void> {
    const re = new RegExp(`${prefix} tidsavgrenset og vil gå ut ${formattedOslo}`);
    await expect(this.textContains(re)).toBeVisible();
  }

  // actions
  async approveStandardAndWaitLogout(redirectUrl: string): Promise<void> {
    await Promise.all([this.waitForLogout(redirectUrl), this.buttonApprove.click()]);
  }

  async approveFullmaktAndWaitLogout(redirectUrl: string): Promise<void> {
    await Promise.all([this.waitForLogout(redirectUrl), this.buttonFullmaktApprove.click()]);
  }

  async rejectStandardAndWaitLogout(redirectUrl: string): Promise<void> {
    await Promise.all([this.waitForLogout(redirectUrl), this.buttonReject.click()]);
  }

  async waitForLogout(redirectUrl: string, timeout = 15000): Promise<void> {
    // First ensure the logout redirect happens
    await this.page.waitForURL(/login\.test\.idporten\.no\/logout\/success/i, { timeout });

    // Then ensure we land on the final page
    await this.page.waitForURL(redirectUrl, { timeout });
  }
}
