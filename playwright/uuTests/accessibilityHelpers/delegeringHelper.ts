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
    if (
      !this.enabled ||
      this.page.isClosed() ||
      !new URL(this.page.url()).pathname.startsWith('/accessmanagement/ui')
    )
      return;
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
    if (results.violations.length) {
      await this.page.evaluate((violations) => {
        const overlay = document.createElement('div');
        overlay.id = 'uu-findings-overlay';
        overlay.setAttribute('popover', 'manual');
        overlay.style.cssText =
          'position:absolute;inset:0;margin:0;padding:0;border:0;width:100%;height:100%;background:transparent;overflow:visible;pointer-events:none;z-index:2147483647';
        violations.forEach((violation, index) => {
          violation.nodes.forEach((node) => {
            if (node.target.length !== 1 || typeof node.target[0] !== 'string') return;
            const element = document.querySelector(node.target[0]);
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const marker = document.createElement('div');
            marker.style.cssText = `position:absolute;left:${rect.left + scrollX - 3}px;top:${rect.top + scrollY - 3}px;width:${Math.max(rect.width, 12) + 6}px;height:${Math.max(rect.height, 12) + 6}px;outline:3px solid #d00000;`;
            const label = document.createElement('span');
            label.textContent = `${index + 1}: ${violation.id}`;
            label.style.cssText =
              'position:absolute;bottom:100%;left:0;background:#d00000;color:white;font:12px sans-serif;padding:3px;white-space:nowrap';
            marker.append(label);
            overlay.append(marker);
          });
        });
        document.body.append(overlay);
        overlay.showPopover();
      }, results.violations);
      try {
        await testInfo.attach(`${name}-marked-screenshot`, {
          body: await this.page.screenshot({ fullPage: true }),
          contentType: 'image/png',
        });
      } finally {
        await this.page.evaluate(() => document.getElementById('uu-findings-overlay')?.remove());
      }
    }

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
