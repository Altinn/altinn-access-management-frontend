import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class runAccessibilityTests {
  scanned = false;
  constructor(
    public page: Page,
    public enabled = true,
  ) {}

  /** Scan the current page without navigating away from the state under test. */
  async scan(testInfo: TestInfo, name: string) {
    if (!this.enabled) return;
    await this.page.bringToFront();
    // Contrast checks must use final colors, rather than an opening transition.
    await this.page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === 'running' &&
              Number.isFinite(animation.effect?.getComputedTiming().endTime),
          )
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    const builder = new AxeBuilder({ page: this.page })
      .options({ resultTypes: ['violations', 'incomplete'] })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
    // #2509: avoid copying huge intermediate results between pages when there are no iframes.
    if (this.page.frames().length === 1) builder.setLegacyMode();
    const results = await builder.analyze();
    // Axe uses a temporary page to aggregate results; restore the test page.
    await this.page.bringToFront();
    this.scanned = true;

    // Attach before asserting so failures also contain the complete findings.
    await testInfo.attach(`${name}-axe-results`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    await testInfo.attach(`${name}-screenshot`, {
      body: await this.page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
    await testInfo.attach(`${name}-violations`, {
      body: JSON.stringify(summary, null, 2),
      contentType: 'application/json',
    });
    expect.soft(summary, `UU-funn på ${name}; se vedlagt axe-rapport`).toEqual([]);
  }

  async checkDialog(
    testInfo: TestInfo,
    {
      searchPlaceholder,
      errorTitle,
      trigger,
    }: {
      searchPlaceholder: string;
      errorTitle: string;
      trigger: Locator;
    },
  ) {
    if (!this.enabled) return;
    const dialog = this.page.getByRole('dialog');
    const search = dialog.getByPlaceholder(searchPlaceholder);
    await search.click();
    const tabStops = await dialog.evaluate(
      (el) =>
        [
          ...el.querySelectorAll<HTMLElement>(
            'button, input, select, textarea, a[href], [tabindex]',
          ),
        ].filter(
          (node) =>
            node.tabIndex >= 0 && !node.matches(':disabled') && node.getClientRects().length > 0,
        ).length,
    );
    expect(tabStops).toBeGreaterThan(1);
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i <= tabStops; i++) {
        await this.page.keyboard.press(key);
        await expect.soft
          .poll(
            () =>
              dialog.evaluate((el) => !document.hasFocus() || el.contains(document.activeElement)),
            {
              message: `${key}: fokus skal holdes i dialogen`,
              timeout: 1000,
            },
          )
          .toBe(true);
      }
    }
    const searchRoute = '**/resources/search?**';
    const failSearch = (route: import('@playwright/test').Route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    await this.page.route(searchRoute, failSearch);
    try {
      await search.fill('uu-simulert-søkefeil');
      await expect(dialog.getByRole('alert')).toContainText(errorTitle);
      await this.scan(testInfo, 'simulert-søkefeil');
    } finally {
      await this.page.unroute(searchRoute, failSearch);
    }
    await search.click();
    // A search input consumes Escape to clear its value; test modal dismissal from a button.
    await dialog.getByRole('button', { name: 'Lukk', exact: true }).focus();
    await this.page.keyboard.press('Escape');
    await expect.soft(dialog).toBeHidden({ timeout: 1000 });
    if (await dialog.isVisible())
      await dialog.getByRole('button', { name: 'Lukk', exact: true }).click();
    await expect.soft(trigger).toBeFocused();
    await trigger.focus();
    await this.page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect.soft
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
      .toBe(true);
  }
}
