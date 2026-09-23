import { expect, type Locator, type Page, type Route, type TestInfo } from '@playwright/test';

import { collectScanMetadata } from './accessibilityReport';
import { scanPage } from './axeScanner';
import type { TestReportContext } from './reportContext';

/** Records a pass/fail assertion as a UU finding instead of failing the test. */
async function reportCheck(
  testInfo: TestInfo,
  page: Page,
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
  await testInfo.attach(`${name}-uu-check`, {
    body: JSON.stringify({
      name,
      finding,
      metadata: await collectScanMetadata(testInfo, page, name),
    }),
    contentType: 'application/json',
  });
}

/** Keyboard/focus contract for a dialog: tab trap, Escape to close, focus return, and an announced search error. */
export async function checkDialogInteractions(
  page: Page,
  testInfo: TestInfo,
  reportContext: TestReportContext,
  {
    searchPlaceholder,
    errorTitle,
    trigger,
  }: { searchPlaceholder: string; errorTitle: string; trigger: Locator },
) {
  const check = (name: string, fn: () => void | Promise<void>) =>
    reportCheck(testInfo, page, name, fn);

  const dialog = page.getByRole('dialog');
  if (!(await dialog.isVisible())) await trigger.click({ timeout: 5000 });
  const search = dialog.getByPlaceholder(searchPlaceholder);
  await search.click();
  const tabStops = await dialog.evaluate(
    (el) =>
      [
        ...el.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]'),
      ].filter(
        (node) =>
          node.tabIndex >= 0 && !node.matches(':disabled') && node.getClientRects().length > 0,
      ).length,
  );
  await check('Dialogen har flere tabulatorstopp', () => {
    expect(tabStops).toBeGreaterThan(1);
  });
  for (const key of ['Tab', 'Shift+Tab']) {
    for (let i = 0; i <= tabStops; i++) {
      await page.keyboard.press(key);
      await check(`${key} holder fokus i dialogen (${i + 1})`, async () => {
        await expect
          .poll(
            () =>
              dialog.evaluate((el) => !document.hasFocus() || el.contains(document.activeElement)),
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
  const failSearch = (route: Route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  await page.route(searchRoute, failSearch);
  try {
    await search.fill('uu-simulert-søkefeil');
    await check('Søkefeil annonseres som varsel', async () => {
      await expect(dialog.getByRole('alert')).toContainText(errorTitle);
    });
    await scanPage(page, testInfo, reportContext, 'simulert-søkefeil');
  } finally {
    await page.unroute(searchRoute, failSearch);
  }
  await search.click();
  // A search input consumes Escape to clear its value; test modal dismissal from a button.
  await dialog.getByRole('button', { name: 'Lukk', exact: true }).focus();
  await page.keyboard.press('Escape');
  await check('Escape lukker dialogen', async () => {
    await expect(dialog).toBeHidden({ timeout: 1000 });
  });
  if (await dialog.isVisible())
    await dialog.getByRole('button', { name: 'Lukk', exact: true }).click();
  await check('Fokus returnerer til Gi fullmakt', async () => {
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
}
