import fs from 'node:fs';
import path from 'node:path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { AxeResults } from 'axe-core';

type Violation = AxeResults['violations'][number];
type Scan = {
  area: string;
  test: string;
  stage: string;
  page: string;
  violations: Violation[];
  file?: string;
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
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Samler axe-funnene fra alle testene:
 * - `<outputFolder>/index.html`: samleside med én rad per regel og lenke til hver skanning.
 * - `<outputFolder>/summary.md`: kort oppsummering som CI legger i jobboppsummeringen.
 * - Én linje i terminalen, og en GitHub-advarsel i CI. Brekker aldri bygget.
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
    let errors = 0;
    fs.rmSync(outputFolder, { recursive: true, force: true });

    for (const { test, result } of this.results.values()) {
      errors += result.annotations.filter(({ type }) => type === 'UU-feil').length;
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
          scan.file = `scan-${scans.length + 1}.html`;
          fs.mkdirSync(outputFolder, { recursive: true });
          fs.writeFileSync(path.join(outputFolder, scan.file), html);
        }
        scans.push(scan);
      }
    }
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
    fs.writeFileSync(
      path.join(outputFolder, 'summary.md'),
      [
        `**UU (axe):** ${headline}.`,
        ...(sortedRules.length
          ? [
              '',
              '| Alvorlighet | Regel | Skanninger |',
              '|---|---|---:|',
              ...sortedRules.map(
                ({ violation, scans }) =>
                  `| ${impact(violation)} | ${violation.help} \`${violation.id}\` | ${scans.length} |`,
              ),
            ]
          : []),
        '',
      ].join('\n'),
    );

    console.log(`UU: ${headline} → ${path.join(outputFolder, 'index.html')}`);
    if (process.env.GITHUB_ACTIONS && (rules.size || errors)) {
      // Workflow-kommando: gul advarsel på kjøringen, ikke rødt bygg.
      console.log(`::warning title=UU-funn::${headline}. Se UU-rapporten i jobboppsummeringen.`);
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

function renderIndex(headline: string, rules: Rule[], scans: Scan[]) {
  const scanLink = (scan: Scan, text: string) =>
    scan.file ? `<a href="${scan.file}">${escapeHtml(text)}</a>` : escapeHtml(text);
  const places = (rule: Rule) => {
    const items = rule.scans.map(
      (scan) => `<li>${scanLink(scan, `${scan.area} – ${scan.stage}`)}</li>`,
    );
    if (items.length <= MAX_PLACES) return `<ul>${items.join('')}</ul>`;
    return `<ul>${items.slice(0, MAX_PLACES).join('')}</ul><details><summary>Vis ${items.length - MAX_PLACES} til</summary><ul>${items.slice(MAX_PLACES).join('')}</ul></details>`;
  };
  const ruleRows = rules
    .map(
      (rule) =>
        `<tr><td><span class="impact ${escapeHtml(rule.violation.impact ?? '')}">${impact(rule.violation)}</span></td><td><a href="${escapeHtml(rule.violation.helpUrl)}">${escapeHtml(rule.violation.help)}</a><br><code>${escapeHtml(rule.violation.id)}</code></td><td>${rule.scans.length} skanninger<br>${rule.nodes} elementer</td><td>${places(rule)}</td></tr>`,
    )
    .join('');
  const scanRows = [...scans]
    .sort((a, b) => b.violations.length - a.violations.length)
    .map((scan) => {
      const count = scan.violations.length;
      return `<tr><td>${escapeHtml(scan.area)}</td><td>${scanLink(scan, scan.test)}<br><small>${escapeHtml(scan.stage)} · <code>${escapeHtml(scan.page)}</code></small></td><td>${count ? `<span class="bad">${count} ${count === 1 ? 'regel' : 'regler'}</span>` : '<span class="ok">Ingen</span>'}</td></tr>`;
    })
    .join('');
  const table = (caption: string, head: string[], rows: string) =>
    `<div class="scroll" role="region" aria-label="${caption}" tabindex="0"><table><caption>${caption}</caption><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  const environment = process.env.environment?.toUpperCase() ?? '';
  const generated = new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' });

  return `<!doctype html>
<html lang="nb">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UU-rapport ${environment}</title>
<style>
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
</style>
<main>
<h1>UU-rapport ${environment}</h1>
<p><strong>${escapeHtml(headline)}.</strong><br><small>Generert ${generated}. Automatiske funn fra axe (WCAG 2.2 A/AA). Ingen funn betyr ikke at siden er universelt utformet.</small></p>
${rules.length ? table('Brudd per regel', ['Alvorlighet', 'Regel', 'Omfang', 'Hvor'], ruleRows) : '<p>Ingen automatiske brudd funnet.</p>'}
${table('Alle skanninger', ['Område', 'Test', 'Brudd'], scanRows)}
</main>
</html>
`;
}
