import type { AxeResults } from 'axe-core';
import { createHtmlReport } from 'axe-html-reporter';

import { html } from './html';

type ScanInfo = { title: string; stage: string; url: string; language: string | null };

/** axe-html-reporter's standard report, with scan info, an incomplete warning and the marked screenshot on top. */
export function renderAccessibilityReport(results: AxeResults, screenshot: Buffer, info: ScanInfo) {
  const rows = [
    ['Test', info.title],
    ['Skannesteg', info.stage],
    ['URL', info.url],
    ['Språk', info.language || 'Ukjent'],
  ].map(
    ([label, value]) =>
      html`<dt><strong>${label}</strong></dt>
        <dd>${value}</dd>`,
  );

  // The reporter lists incomplete checks in a collapsed accordion that is easy to miss.
  const incomplete = results.incomplete.length;
  const incompleteWarning =
    incomplete > 0 &&
    html`<p style="background:#fff3cd;border:1px solid #f0c36d;padding:12px 16px;font-weight:600">
      ⚠️ ${incomplete} ${incomplete === 1 ? 'regel krever' : 'regler krever'} manuell vurdering — se
      «Incomplete» lenger ned.
    </p>`;

  return createHtmlReport({
    results,
    options: {
      doNotCreateReportFile: true,
      projectKey: `UU: ${info.title}`,
      customSummary: html`
        ${incompleteWarning}
        <dl>${rows}</dl>
        <img
          alt="Skjermbilde fra UU-skanningen"
          style="max-width:100%"
          src="data:image/png;base64,${screenshot.toString('base64')}"
        />
      `.toString(),
    },
  });
}
