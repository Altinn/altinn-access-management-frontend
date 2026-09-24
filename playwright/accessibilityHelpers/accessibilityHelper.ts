import type { Page, TestInfo } from '@playwright/test';

import { runOptionalCheck } from './accessibilityCheckBoundary';
import { scanPage } from './axeScanner';
import { checkDialogInteractions, type DialogCheckOptions } from './dialogAccessibilityChecks';
import type { TestReportContext } from './reportContext';

export class runAccessibilityTests {
  scanned = false;
  constructor(
    public page: Page,
    private readonly testInfo: TestInfo,
    private readonly reportContext: TestReportContext,
    public enabled = true,
  ) {}

  forPage(page: Page) {
    return new runAccessibilityTests(page, this.testInfo, this.reportContext, this.enabled);
  }

  /** Scan the current page without navigating away from the state under test. */
  async scan(name: string) {
    await runOptionalCheck(this.testInfo, this.enabled, name, async () => {
      const { scanned } = await scanPage(this.page, this.testInfo, this.reportContext, name);
      if (scanned) this.scanned = true;
    });
  }

  /**
   * Checks this dialog's tab trap, Escape-to-close and focus-return, plus that
   * a simulated search-request failure (HTTP 500) is announced accessibly.
   */
  async checkDialog(options: DialogCheckOptions) {
    await runOptionalCheck(this.testInfo, this.enabled, options.name ?? 'dialogkontroller', () =>
      checkDialogInteractions(this.page, this.testInfo, this.reportContext, options),
    );
  }
}
