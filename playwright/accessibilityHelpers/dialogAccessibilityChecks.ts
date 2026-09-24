import { expect, type Locator, type Page, type Route, type TestInfo } from '@playwright/test';

import { collectScanMetadata } from './accessibilityReport';
import { scanPage } from './axeScanner';

export type DialogCheckOptions = {
  /** Stage name used in the report, e.g. 'delegeringsdialog'. */
  name?: string;
  searchPlaceholder: string;
  /** Glob for the dialog's search request, used to simulate a failing search. */
  searchRoute: string;
  errorTitle: string;
  /** Accessible name of the dialog's close button, from the active language's texts. */
  closeButtonName: string;
  trigger: Locator;
};

type CheckResult = { name: string; finding?: string };

/** Records a pass/fail assertion as a UU finding instead of failing the test. */
async function runCheck(
  testInfo: TestInfo,
  results: CheckResult[],
  name: string,
  check: () => void | Promise<void>,
) {
  let finding: string | undefined;
  try {
    await check();
  } catch (error) {
    // Assertions are findings; runtime errors are reported by the outer error boundary.
    if (!(error instanceof Error) || !('matcherResult' in error)) throw error;
    finding = error.message.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'), '');
    testInfo.annotations.push({ type: 'UU-funn', description: name });
  }
  results.push({ name, finding });
}

/** Keyboard/focus contract for a dialog: tab trap, Escape to close, focus return, and an announced search error. */
export async function checkDialogInteractions(
  page: Page,
  testInfo: TestInfo,
  {
    name = 'dialogkontroller',
    searchPlaceholder,
    searchRoute,
    errorTitle,
    closeButtonName,
    trigger,
  }: DialogCheckOptions,
) {
  const results: CheckResult[] = [];
  const check = (checkName: string, fn: () => void | Promise<void>) =>
    runCheck(testInfo, results, checkName, fn);

  try {
    const dialog = page.getByRole('dialog');
    const closeButton = dialog.getByRole('button', { name: closeButtonName, exact: true });
    if (!(await dialog.isVisible())) await trigger.click({ timeout: 5000 });
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
    await check('Dialogen har flere tabulatorstopp', () => {
      expect(tabStops).toBeGreaterThan(1);
    });
    for (const key of ['Tab', 'Shift+Tab']) {
      await check(`${key} holder fokus i dialogen`, async () => {
        for (let i = 0; i <= tabStops; i++) {
          await page.keyboard.press(key);
          await expect
            .poll(
              () =>
                dialog.evaluate(
                  (el) => !document.hasFocus() || el.contains(document.activeElement),
                ),
              {
                message: `UU-funn: ${key} nr. ${i + 1} flytter fokus til innhold utenfor dialogen`,
                timeout: 1000,
              },
            )
            .toBe(true);
        }
      });
    }
    const failSearch = (route: Route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
    await page.route(searchRoute, failSearch);
    try {
      await search.fill('uu-simulert-søkefeil');
      await check('Søkefeil annonseres som varsel', async () => {
        await expect(dialog.getByRole('alert')).toContainText(errorTitle);
      });
      await scanPage(page, testInfo, 'simulert-søkefeil');
    } finally {
      await page.unroute(searchRoute, failSearch);
    }
    await search.click();
    // A search input consumes Escape to clear its value; test modal dismissal from a button.
    await closeButton.focus();
    await page.keyboard.press('Escape');
    await check('Escape lukker dialogen', async () => {
      await expect(dialog).toBeHidden({ timeout: 1000 });
    });
    if (await dialog.isVisible()) await closeButton.click();
    await check('Fokus returnerer til utløserknappen', async () => {
      await expect(trigger).toBeFocused();
    });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await check('Fokus flyttes inn i den åpne dialogen', async () => {
      await expect
        .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)), {
          message: 'UU-funn: fokus flyttes ikke inn i den åpne dialogen',
        })
        .toBe(true);
    });
  } finally {
    // One attachment per dialog keeps the report at one row, even if a runtime error aborts midway.
    if (results.length)
      await testInfo.attach(`${name}-uu-check`, {
        body: JSON.stringify({
          name,
          checks: results,
          metadata: await collectScanMetadata(testInfo, page, name),
        }),
        contentType: 'application/json',
      });
  }
}
