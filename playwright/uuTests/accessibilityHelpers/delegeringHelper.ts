import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHtmlReport } from 'axe-html-reporter';

type TestParty = { pid?: string; orgNo?: string; name?: string };
const testDataLabels = {
  systemId: 'System-ID',
  systemName: 'Systemnavn',
  vendorOrgNumber: 'Systemleverandør (org.nr.)',
  validTo: 'Gyldig til (UTC)',
  resource: 'Ressurs',
} as const;
type AccessibilityTestData = {
  from?: TestParty;
  to?: TestParty;
} & Partial<Record<keyof typeof testDataLabels, string>>;

function formatTestData({ from, to, ...data }: AccessibilityTestData) {
  const partyLabels = { pid: 'PID', orgNo: 'org.nr.', name: 'navn' } as const;
  return Object.fromEntries(
    [
      ...Object.entries({ Avgiver: from, Mottaker: to }).flatMap(([role, party]) =>
        Object.entries(party ?? {}).map(([key, value]) => [
          `${role} (${partyLabels[key as keyof TestParty]})`,
          value,
        ]),
      ),
      ...Object.entries(data).map(([key, value]) => [
        testDataLabels[key as keyof typeof testDataLabels],
        value,
      ]),
    ].filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
}

export class runAccessibilityTests {
  private testData: AccessibilityTestData = {};

  setTestData(data: AccessibilityTestData) {
    this.testData = data;
  }

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

    // Keep findings in the report without failing the functional test.
    await testInfo.attach(`${name}-axe-results`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    let screenshot = await this.page.screenshot({ fullPage: true });
    await testInfo.attach(`${name}-screenshot`, {
      body: screenshot,
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
        screenshot = await this.page.screenshot({ fullPage: true });
        await testInfo.attach(`${name}-marked-screenshot`, {
          body: screenshot,
          contentType: 'image/png',
        });
      } finally {
        await this.page.evaluate(() => document.getElementById('uu-findings-overlay')?.remove());
      }
    }
    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
    const viewport = this.page.viewportSize();
    const context = {
      Test: testInfo.titlePath.slice(1).join(' › '),
      Testfil: `${testInfo.file.replace(`${testInfo.config.rootDir}/`, '')}:${testInfo.line}`,
      Skannesteg: name,
      Språk: (await this.page.locator('html').getAttribute('lang')) || 'Ukjent',
      ...(viewport ? { Skjermstørrelse: `${viewport.width} × ${viewport.height}` } : {}),
      ...formatTestData(this.testData),
    };
    const testDataHtml = `<section aria-label="Testdata"><h2>Testdata</h2><dl>${Object.entries(
      context,
    )
      .map(
        ([label, value]) =>
          `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value)}</dd>`,
      )
      .join('')}</dl></section>`;
    await testInfo.attach(`${name}-uu-report`, {
      body: createHtmlReport({
        results,
        options: {
          doNotCreateReportFile: true,
          projectKey: `UU: ${testInfo.title}`,
          customSummary: `${testDataHtml}<img alt="Skjermbilde fra UU-skanningen" style="max-width:100%;height:auto" src="data:image/png;base64,${screenshot.toString('base64')}">`,
        },
      }),
      contentType: 'text/html',
    });

    for (const violation of results.violations) {
      testInfo.annotations.push({
        type: 'UU-funn',
        description: `${name}: ${violation.id} — ${violation.help}`,
      });
    }
  }

  private async reportCheck(testInfo: TestInfo, name: string, check: () => Promise<void>) {
    let finding: string | undefined;
    try {
      await check();
    } catch (error) {
      // Only assertion failures are findings; browser/runtime errors must still fail the test.
      if (!(error instanceof Error) || !('matcherResult' in error)) throw error;
      finding = error.message.replace(/\x1b\[[0-9;]*m/g, '');
      testInfo.annotations.push({ type: 'UU-funn', description: name });
    }
    await testInfo.attach(`${name}-uu-check`, {
      body: JSON.stringify({ name, finding }),
      contentType: 'application/json',
    });
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
    await this.reportCheck(testInfo, 'Dialogen har flere tabulatorstopp', async () => {
      expect(tabStops).toBeGreaterThan(1);
    });
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let i = 0; i <= tabStops; i++) {
        await this.page.keyboard.press(key);
        await this.reportCheck(testInfo, `${key} holder fokus i dialogen (${i + 1})`, async () => {
          await expect
            .poll(
              () =>
                dialog.evaluate(
                  (el) => !document.hasFocus() || el.contains(document.activeElement),
                ),
              {
                message: `UU-funn: ${key} flytter fokus til innhold utenfor dialogen`,
                timeout: 1000,
              },
            )
            .toBe(true);
        });
      }
    }
    const searchRoute = '**/resources/search?**';
    const failSearch = (route: import('@playwright/test').Route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    await this.page.route(searchRoute, failSearch);
    try {
      await search.fill('uu-simulert-søkefeil');
      await this.reportCheck(testInfo, 'Søkefeil annonseres som varsel', async () => {
        await expect(dialog.getByRole('alert')).toContainText(errorTitle);
      });
      await this.scan(testInfo, 'simulert-søkefeil');
    } finally {
      await this.page.unroute(searchRoute, failSearch);
    }
    await search.click();
    // A search input consumes Escape to clear its value; test modal dismissal from a button.
    await dialog.getByRole('button', { name: 'Lukk', exact: true }).focus();
    await this.page.keyboard.press('Escape');
    await this.reportCheck(testInfo, 'Escape lukker dialogen', async () => {
      await expect(dialog).toBeHidden({ timeout: 1000 });
    });
    if (await dialog.isVisible())
      await dialog.getByRole('button', { name: 'Lukk', exact: true }).click();
    await this.reportCheck(testInfo, 'Fokus returnerer til Gi fullmakt', async () => {
      await expect(trigger).toBeFocused();
    });
    await trigger.focus();
    await this.page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await this.reportCheck(testInfo, 'Fokus flyttes inn i den åpne dialogen', async () => {
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)), {
          message: 'UU-funn: fokus flyttes ikke inn i den åpne dialogen',
        })
        .toBe(true);
    });
  }
}
