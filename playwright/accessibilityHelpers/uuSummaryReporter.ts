import fs from 'node:fs';
import path from 'node:path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { AxeResults } from 'axe-core';

import { html, type SafeHtml } from './html';

type Violation = AxeResults['violations'][number];
type Scan = {
  area: string;
  test: string;
  stage: string;
  page: string;
  violations: Violation[];
  /** Link to the scan's axe report, if one was written. */
  href?: string;
};
type Rule = { violation: Violation; nodes: number; scans: Scan[] };

const IMPACT_LABEL: Record<string, string> = {
  critical: 'Kritisk',
  serious: 'Alvorlig',
  moderate: 'Moderat',
  minor: 'Mindre alvorlig',
};
const IMPACT_ORDER = Object.keys(IMPACT_LABEL);
const impact = (violation: Violation) => IMPACT_LABEL[violation.impact ?? ''] ?? 'Ukjent';

/**
 * Samler axe-funnene fra alle testene:
 * - `<outputFolder>/index.html`: samleside med én rad per regel og lenke til hver skanning.
 * - Én linje i terminalen, lokalt med sti til samlesiden.
 * - I CI: gul advarsel og kort oppsummering i jobben. Lenken til rapporten skrives av
 *   «Show report URL» i template-playwright.yml. Brekker aldri bygget.
 */
export default class UuSummaryReporter implements Reporter {
  // Siste forsøk per test, så retries ikke telles dobbelt.
  private readonly results = new Map<string, { test: TestCase; result: TestResult }>();

  constructor(private readonly options: { outputFolder: string }) {}

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.set(test.id, { test, result });
  }

  onEnd() {
    try {
      this.write();
    } catch (error) {
      console.warn('Kunne ikke skrive UU-oppsummering:', error);
    }
  }

  private write() {
    const { outputFolder } = this.options;
    const scans: Scan[] = [];
    const technicalErrors: string[] = [];
    fs.rmSync(outputFolder, { recursive: true, force: true });
    // Absolute in CI: Azure also serves `…/uu` without a trailing slash, which breaks relative links.
    const linkBase = process.env.REPORT_URL ? `${process.env.REPORT_URL}uu/` : '';

    for (const { test, result } of this.results.values()) {
      for (const { type, description } of result.annotations) {
        if (type === 'UU-feil') technicalErrors.push(`${test.title}: ${description ?? ''}`);
      }
      for (const attachment of result.attachments) {
        if (!attachment.name.endsWith('-axe-results')) continue;
        const stage = attachment.name.replace(/-axe-results$/, '');
        const { violations, url } = JSON.parse(read(attachment) ?? '{}') as Partial<AxeResults>;
        const scan: Scan = {
          area: path.basename(path.dirname(test.location.file)),
          test: test.title,
          stage,
          page: url ? new URL(url).pathname.replace('/accessmanagement/ui', '') || '/' : '',
          violations: violations ?? [],
        };
        const html = read(result.attachments.find(({ name }) => name === `${stage}-uu-report`));
        if (html) {
          const file = `scan-${scans.length + 1}.html`;
          fs.mkdirSync(outputFolder, { recursive: true });
          fs.writeFileSync(path.join(outputFolder, file), html);
          scan.href = linkBase + file;
        }
        scans.push(scan);
      }
    }
    const errors = technicalErrors.length;
    if (!scans.length && !errors) return;

    const rules = new Map<string, Rule>();
    for (const scan of scans) {
      for (const violation of scan.violations) {
        const rule = rules.get(violation.id) ?? { violation, nodes: 0, scans: [] };
        rule.nodes += violation.nodes.length;
        rule.scans.push(scan);
        rules.set(violation.id, rule);
      }
    }
    const sortedRules = [...rules.values()].sort(
      (a, b) =>
        IMPACT_ORDER.indexOf(a.violation.impact ?? '') -
          IMPACT_ORDER.indexOf(b.violation.impact ?? '') || b.scans.length - a.scans.length,
    );
    const critical = sortedRules.filter(({ violation }) => violation.impact === 'critical').length;
    const headline = `${scans.length} skanninger, ${rules.size} regler med brudd (${critical} kritiske), ${errors} tekniske UU-feil`;

    fs.mkdirSync(outputFolder, { recursive: true });
    fs.writeFileSync(
      path.join(outputFolder, 'index.html'),
      renderIndex(headline, sortedRules, scans),
    );
    if (!process.env.GITHUB_ACTIONS) {
      console.log(`UU: ${headline} → ${path.join(outputFolder, 'index.html')}`);
      return;
    }
    // I CI skrives lenken til rapporten bare av «Show report URL» i template-playwright.yml.
    console.log(`UU: ${headline}`);

    if (rules.size || errors) {
      // Workflow-kommando: gul advarsel på kjøringen, ikke rødt bygg.
      console.log(`::warning title=UU-funn::${headline}.`);
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `${renderStepSummary(sortedRules, scans.length, technicalErrors)}\n\n`,
      );
    }
  }

  printsToStdio() {
    return false;
  }
}

function read(attachment?: TestResult['attachments'][number]) {
  if (attachment?.body) return attachment.body.toString();
  if (attachment?.path) return fs.readFileSync(attachment.path, 'utf8');
}

const MAX_PLACES = 5;

/** Rødt for kritisk/alvorlig, varseltrekant for moderat. */
const IMPACT_ICON: Record<string, string> = {
  critical: '🔴',
  serious: '🔴',
  moderate: '⚠️',
  minor: 'ℹ️',
};
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const icon = (violation: Violation) => IMPACT_ICON[violation.impact ?? ''] ?? 'ℹ️';

/** Jobboppsummering i GitHub (begrenset HTML: ingen CSS). Bare funn, med lenke til hver skanning. */
function renderStepSummary(rules: Rule[], scanCount: number, technicalErrors: string[]) {
  const environment = process.env.environment?.toUpperCase() ?? '';
  const count = (impacts: string[]) =>
    rules.filter(({ violation }) => impacts.includes(violation.impact ?? '')).length;
  const severe = count(['critical', 'serious']);
  const moderate = count(['moderate']);
  const minor = rules.length - severe - moderate;
  const status = severe
    ? '🔴'
    : moderate
      ? '⚠️'
      : rules.length || technicalErrors.length
        ? 'ℹ️'
        : '✅';
  const parts = [
    severe && `🔴 ${severe} alvorlige`,
    moderate && `⚠️ ${moderate} moderate`,
    minor && `ℹ️ ${minor} mindre alvorlige`,
  ].filter(Boolean);
  const reportUrl = process.env.REPORT_URL ? `${process.env.REPORT_URL}uu/index.html` : undefined;

  const ruleDetails = rules.map(
    (rule) =>
      html`<details>
        <summary>
          ${icon(rule.violation)} <b>${rule.violation.help}</b> <code>${rule.violation.id}</code> –
          ${plural(rule.scans.length, 'skanning', 'skanninger')},
          ${plural(rule.nodes, 'element', 'elementer')}
        </summary>
        <ul>
          ${rule.scans.map(
            (scan) =>
              html`<li>
                ${scanLink(scan, `${scan.area} – ${scan.stage}`)} <code>${scan.page}</code>
              </li>`,
          )}
        </ul>
        <p><a href="${rule.violation.helpUrl}">Om regelen (axe)</a></p>
      </details>`,
  );
  const errorDetails = technicalErrors.length
    ? html`<details>
        <summary>
          ⚙️
          <b>${plural(technicalErrors.length, 'teknisk UU-feil', 'tekniske UU-feil')}</b>
          (skanningen feilet)
        </summary>
        <ul>
          ${technicalErrors.map((error) => html`<li><code>${error}</code></li>`)}
        </ul>
      </details>`
    : '';

  return html`
    <br />
    <h3>${status} Universell utforming ${environment}</h3>
    <p>
      ${parts.length ? `Regler med brudd: ${parts.join(' · ')}` : 'Ingen automatiske brudd'} ·
      ${plural(scanCount, 'skanning', 'skanninger')}${
        reportUrl ? html` · <a href="${reportUrl}">Åpne UU-rapporten</a>` : ''
      }
    </p>
    ${ruleDetails} ${errorDetails}
  `
    .toString()
    .replace(/^[ \t]+/gm, '');
}

const STYLE = `
  :root{color-scheme:light dark;--fg:#1e2b3c;--muted:#566270;--bg:#fff;--line:#d5dde5;--head:#eaf1f7;--link:#005db1;--bad:#b3261e;--ok:#1b6e3a}
  @media (prefers-color-scheme:dark){:root{--fg:#e6ebf0;--muted:#a8b3bf;--bg:#14191f;--line:#33404d;--head:#1f2a35;--link:#7cb8ff;--bad:#ff8a80;--ok:#7ed69a}}
  body{font:16px/1.5 system-ui,sans-serif;max-width:1100px;margin:0 auto;padding:24px 16px;color:var(--fg);background:var(--bg)}
  a{color:var(--link)} a:focus-visible,.scroll:focus-visible,summary:focus-visible{outline:3px solid var(--link);outline-offset:2px}
  .scroll{overflow-x:auto;margin-bottom:32px}
  table{width:100%;border-collapse:collapse}
  caption{text-align:left;font-weight:600;padding-bottom:8px}
  th,td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid var(--line)}
  th{background:var(--head)}
  ul{margin:0;padding-left:18px} small,code{color:var(--muted)}
  .impact{font-weight:600} .critical,.serious,.bad{color:var(--bad);font-weight:600} .ok{color:var(--ok)}
`;

const scanLink = (scan: Scan, text: string) =>
  scan.href ? html`<a href="${scan.href}">${text}</a>` : text;

const table = (caption: string, columns: string[], rows: SafeHtml[]) => html`
  <div
    class="scroll"
    role="region"
    aria-label="${caption}"
    tabindex="0"
  >
    <table>
      <caption>
        ${caption}
      </caption>
      <thead>
        <tr>
          ${columns.map((column) => html`<th scope="col">${column}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
`;

function places(rule: Rule) {
  const items = rule.scans.map(
    (scan) => html`<li>${scanLink(scan, `${scan.area} – ${scan.stage}`)}</li>`,
  );
  if (items.length <= MAX_PLACES)
    return html`<ul>
      ${items}
    </ul>`;
  return html`
    <ul>
      ${items.slice(0, MAX_PLACES)}
    </ul>
    <details>
      <summary>Vis ${items.length - MAX_PLACES} til</summary>
      <ul>
        ${items.slice(MAX_PLACES)}
      </ul>
    </details>
  `;
}

const ruleRow = (rule: Rule) => html`
  <tr>
    <td><span class="impact ${rule.violation.impact}">${impact(rule.violation)}</span></td>
    <td>
      <a href="${rule.violation.helpUrl}">${rule.violation.help}</a><br />
      <code>${rule.violation.id}</code>
    </td>
    <td>${rule.scans.length} skanninger<br />${rule.nodes} elementer</td>
    <td>${places(rule)}</td>
  </tr>
`;

function scanRow(scan: Scan) {
  const count = scan.violations.length;
  return html`
    <tr>
      <td>${scan.area}</td>
      <td>
        ${scanLink(scan, scan.test)}<br />
        <small>${scan.stage} · <code>${scan.page}</code></small>
      </td>
      <td>
        ${
          count
            ? html`<span class="bad">${count} ${count === 1 ? 'regel' : 'regler'}</span>`
            : html`<span class="ok">Ingen</span>`
        }
      </td>
    </tr>
  `;
}

function renderIndex(headline: string, rules: Rule[], scans: Scan[]) {
  const environment = process.env.environment?.toUpperCase() ?? '';
  const generated = new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });
  const sortedScans = [...scans].sort((a, b) => b.violations.length - a.violations.length);

  return html`<!doctype html>
    <html lang="nb">
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <title>UU-rapport ${environment}</title>
      <style>
        ${STYLE}
      </style>
      <main>
        <h1>UU-rapport ${environment}</h1>
        <p>
          <strong>${headline}.</strong><br />
          <small>
            Generert ${generated}. Automatiske funn fra axe (WCAG 2.2 A/AA). Ingen funn betyr ikke
            at siden er universelt utformet.
          </small>
        </p>
        ${
          rules.length
            ? table(
                'Brudd per regel',
                ['Alvorlighet', 'Regel', 'Omfang', 'Hvor'],
                rules.map(ruleRow),
              )
            : html`<p>Ingen automatiske brudd funnet.</p>`
        }
        ${table('Alle skanninger', ['Område', 'Test', 'Brudd'], sortedScans.map(scanRow))}
      </main>
    </html> `.toString();
}
