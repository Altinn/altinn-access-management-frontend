import fs from 'node:fs';
import path from 'node:path';

import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import { html, SafeHtml } from '../accessibilityHelpers/html';

const MAX_ERROR_LINES = 12;

/**
 * Jobboppsummering i GitHub for standardtestene: tall øverst, så én sammenleggbar
 * boks per feilet test med feilmelding og lenke rett til testen i Playwright-rapporten
 * (`REPORT_URL` settes i template-playwright.yml). Gjør ingenting utenfor CI.
 */
export default class TestSummaryReporter implements Reporter {
  // Siste forsøk per test, så retries ikke telles dobbelt.
  private readonly results = new Map<string, { test: TestCase; result: TestResult }>();

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.set(test.id, { test, result });
  }

  onEnd(result: FullResult) {
    if (!process.env.GITHUB_STEP_SUMMARY) return;
    try {
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `${renderTestSummary([...this.results.values()], result.duration)}\n\n`,
      );
    } catch (error) {
      console.warn('Kunne ikke skrive testoppsummering:', error);
    }
  }

  printsToStdio() {
    return false;
  }
}

type Entry = { test: TestCase; result: TestResult };

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const stripAnsi = (text: string) => text.replace(ANSI, '');

const testLink = (test: TestCase) =>
  process.env.REPORT_URL ? `${process.env.REPORT_URL}#?testId=${test.id}` : undefined;

/** `område › describe › test`, uten prosjekt og filnavn. */
const title = (test: TestCase) =>
  [path.basename(path.dirname(test.location.file)), ...test.titlePath().slice(3)].join(' › ');

const location = (test: TestCase) =>
  `${path.relative(process.cwd(), test.location.file)}:${test.location.line}`;

/** Én kildelinje (`&#10;` som linjeskift), så markdown ikke bryter opp `<pre>` på tomme linjer. */
function errorText(result: TestResult) {
  const message = stripAnsi(result.errors[0]?.message ?? result.error?.message ?? 'Ukjent feil');
  const lines = message.trim().split('\n');
  const shown = lines.length > MAX_ERROR_LINES ? [...lines.slice(0, MAX_ERROR_LINES), '…'] : lines;
  return new SafeHtml(shown.map((line) => html`${line}`.toString()).join('&#10;'));
}

const minutes = (ms: number) => `${Math.round(ms / 60000)} min`;

export function renderTestSummary(entries: Entry[], duration: number) {
  const environment = process.env.environment?.toUpperCase() ?? '';
  const failed = entries.filter(({ test }) => test.outcome() === 'unexpected');
  const flaky = entries.filter(({ test }) => test.outcome() === 'flaky');
  const skipped = entries.filter(({ test }) => test.outcome() === 'skipped').length;
  const passed = entries.length - failed.length - flaky.length - skipped;
  const status = failed.length ? '❌' : flaky.length ? '⚠️' : '✅';
  const parts = [
    failed.length && `❌ ${failed.length} feilet`,
    flaky.length && `⚠️ ${flaky.length} ustabile`,
    `✅ ${passed} bestått`,
    skipped && `⏭️ ${skipped} hoppet over`,
  ].filter(Boolean);
  const reportUrl = process.env.REPORT_URL;

  const failedDetails = failed.map(({ test, result }) => {
    const link = testLink(test);
    return html`<details>
      <summary>❌ <b>${title(test)}</b></summary>
      <p>
        <code>${location(test)}</code> · ${result.retry + 1}
        forsøk${link ? html` · <a href="${link}">Åpne testen i rapporten</a>` : ''}
      </p>
      <pre>${errorText(result)}</pre>
    </details>`;
  });
  const flakyDetails = flaky.length
    ? html`<details>
        <summary>⚠️ <b>${flaky.length} ustabile tester</b> (bestod på nytt forsøk)</summary>
        <ul>
          ${flaky.map(({ test }) => {
            const link = testLink(test);
            return html`<li>
              ${link ? html`<a href="${link}">${title(test)}</a>` : title(test)}
            </li>`;
          })}
        </ul>
      </details>`
    : '';

  return html`
    <h3>${status} Playwright ${environment}</h3>
    <p>
      ${parts.join(' · ')} ·
      ${minutes(duration)}${
        reportUrl ? html` · <a href="${reportUrl}">Åpne Playwright-rapporten</a>` : ''
      }
    </p>
    ${failedDetails} ${flakyDetails}
  `
    .toString()
    .replace(/^[ \t]+/gm, '');
}
