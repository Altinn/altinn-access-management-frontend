import type { Page, TestInfo } from '@playwright/test';
import type { AxeResults } from 'axe-core';
import { createHtmlReport } from 'axe-html-reporter';

/** Only what the UU report groups on; test details live in the Playwright report and trace. */
export async function collectScanMetadata(testInfo: TestInfo, page: Page, stage: string) {
  return {
    title: testInfo.title,
    area:
      testInfo.annotations.find(({ type }) => type === 'report-area')?.description ||
      'Ukjent område',
    stage,
    url: page.url(),
    language: await page.locator('html').getAttribute('lang'),
  };
}

export function renderAccessibilityReport(
  results: AxeResults,
  screenshot: Buffer,
  metadata: Awaited<ReturnType<typeof collectScanMetadata>>,
) {
  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const summary = {
    Test: metadata.title,
    Område: metadata.area,
    Skannesteg: metadata.stage,
    URL: metadata.url,
    Språk: metadata.language || 'Ukjent',
  };
  const summaryHtml = `<section aria-label="Skanning"><h2>Skanning</h2><dl>${Object.entries(summary)
    .map(
      ([label, value]) =>
        `<dt><strong>${escapeHtml(label)}</strong></dt><dd>${escapeHtml(value)}</dd>`,
    )
    .join('')}</dl></section>`;
  // axe-html-reporter's own "axe-core found N violations" heading only counts
  // violations, and lists incomplete checks in a collapsed accordion further
  // down (aria-expanded="false") that's easy to miss. Surface it up front.
  const incompleteCount = results.incomplete?.length || 0;
  const incompleteWarningHtml = incompleteCount
    ? `<p style="background:#fff3cd;border:1px solid #f0c36d;border-radius:4px;padding:12px 16px;font-weight:600">⚠️ ${incompleteCount} ${incompleteCount === 1 ? 'regel krever' : 'regler krever'} manuell vurdering, fordi axe ikke kunne avgjøre resultatet automatisk — se "Incomplete"-seksjonen under (må åpnes manuelt).</p>`
    : '';
  return createHtmlReport({
    results,
    options: {
      doNotCreateReportFile: true,
      projectKey: `UU: ${metadata.title}`,
      customSummary: `${incompleteWarningHtml}${summaryHtml}<img alt="Skjermbilde fra UU-skanningen" style="max-width:100%;height:auto" src="data:image/png;base64,${screenshot.toString('base64')}">`,
    },
  });
}
