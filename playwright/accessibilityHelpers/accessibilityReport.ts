import path from 'node:path';

import type { Page, TestInfo } from '@playwright/test';
import type { AxeResults } from 'axe-core';
import { createHtmlReport } from 'axe-html-reporter';

import type { ReportContext } from './reportContext';

export async function collectScanMetadata(testInfo: TestInfo, page: Page, stage: string) {
  return {
    title: testInfo.title,
    titlePath: [...testInfo.titlePath],
    file: path.relative(testInfo.config.rootDir, testInfo.file),
    line: testInfo.line,
    project: testInfo.project.name,
    area:
      testInfo.annotations.find(({ type }) => type === 'report-area')?.description ||
      'Ukjent område',
    stage,
    url: page.url(),
    language: await page.locator('html').getAttribute('lang'),
    viewport: page.viewportSize(),
  };
}

export function formatReportContext(data: ReportContext): Record<string, string> {
  const entries: [string, string | undefined][] = [
    ['Avgiver (PID)', data.from?.pid],
    ['Avgiver (org.nr.)', data.from?.orgNo],
    ['Avgiver (navn)', data.from?.name],
    ['Mottaker (PID)', data.to?.pid],
    ['Mottaker (org.nr.)', data.to?.orgNo],
    ['Mottaker (navn)', data.to?.name],
    ['Gyldig til (UTC)', data.validTo],
    ['Ressurs', data.resource],
    ['System-ID', data.systemId],
    ['Systemnavn', data.systemName],
    ['Systemleverandør (org.nr.)', data.vendorOrgNumber],
  ];
  return Object.fromEntries(
    entries.filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

export function renderAccessibilityReport(
  results: AxeResults,
  screenshot: Buffer,
  metadata: Awaited<ReturnType<typeof collectScanMetadata>>,
  context: ReportContext,
) {
  const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const summary = {
    Test: metadata.titlePath.slice(1).join(' › '),
    Testfil: `${metadata.file}:${metadata.line}`,
    Prosjekt: metadata.project,
    Område: metadata.area,
    Skannesteg: metadata.stage,
    URL: metadata.url,
    Språk: metadata.language || 'Ukjent',
    ...(metadata.viewport
      ? { Skjermstørrelse: `${metadata.viewport.width} × ${metadata.viewport.height}` }
      : {}),
    ...formatReportContext(context),
  };
  const testDataHtml = `<section aria-label="Testdata"><h2>Testdata</h2><dl>${Object.entries(
    summary,
  )
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
      customSummary: `${incompleteWarningHtml}${testDataHtml}<img alt="Skjermbilde fra UU-skanningen" style="max-width:100%;height:auto" src="data:image/png;base64,${screenshot.toString('base64')}">`,
    },
  });
}
