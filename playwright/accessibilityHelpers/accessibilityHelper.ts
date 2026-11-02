import type { Page, TestInfo } from '@playwright/test';

import { scanPage } from './axeScanner';

/** UU-skanning for én test. Feil i selve skanningen logges som `UU-feil` og feiler aldri testen. */
export class AccessibilityScanner {
  scanned = false;

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
    private readonly enabled = true,
  ) {}

  /** Scan the current page without navigating away from the state under test. */
  async scan(name: string) {
    if (!this.enabled) return;
    try {
      if (await scanPage(this.page, this.testInfo, name)) this.scanned = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.testInfo.annotations.push({ type: 'UU-feil', description: `${name}: ${message}` });
      console.warn(`UU-feil (${name}): ${message}`);
    }
  }
}
