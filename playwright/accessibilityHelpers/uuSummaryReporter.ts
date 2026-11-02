import fs from 'node:fs';
import path from 'node:path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { AxeResults } from 'axe-core';

type Violation = AxeResults['violations'][number];
type Scan = { area: string; test: string; stage: string; violations: Violation[]; file?: string };
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
        const { violations } = JSON.parse(read(attachment) ?? '{"violations":[]}') as AxeResults;
        const scan: Scan = {
          area: path.basename(path.dirname(test.location.file)),
          test: test.title,
          stage,
          violations,
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

function renderIndex(headline: string, rules: Rule[], scans: Scan[]) {
  const link = (scan: Scan, text: string) =>
    scan.file ? `<a href="${scan.file}">${escapeHtml(text)}</a>` : escapeHtml(text);
  const ruleRows = rules
    .map(
      ({ violation, nodes, scans }) =>
        `<tr><td>${impact(violation)}</td><td><a href="${escapeHtml(violation.helpUrl)}">${escapeHtml(violation.help)}</a><br><code>${violation.id}</code></td><td>${scans.length} skanninger, ${nodes} elementer</td><td>${scans.map((scan) => link(scan, `${scan.area} – ${scan.stage}`)).join('<br>')}</td></tr>`,
    )
    .join('');
  const scanRows = [...scans]
    .sort((a, b) => b.violations.length - a.violations.length)
    .map(
      (scan) =>
        `<tr><td>${escapeHtml(scan.area)}</td><td>${link(scan, scan.test)}<br><small>${escapeHtml(scan.stage)}</small></td><td>${scan.violations.length ? `❌ ${scan.violations.length}` : '✅ 0'}</td></tr>`,
    )
    .join('');
  return `<!doctype html>
<html lang="nb">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>UU-rapport</title>
<style>
  body{font:16px/1.5 system-ui,sans-serif;max-width:1100px;margin:32px auto;padding:0 16px;color:#1e2b3c}
  table{width:100%;border-collapse:collapse;margin-bottom:32px}
  th,td{text-align:left;vertical-align:top;padding:8px 12px;border-bottom:1px solid #d5dde5}
  th{background:#eaf1f7}
  small,code{color:#555}
</style>
<h1>UU-rapport</h1>
<p>${escapeHtml(headline)}. Automatiske funn fra axe; ingen funn betyr ikke at siden er universelt utformet.</p>
${rules.length ? `<h2>Brudd per regel</h2><table><thead><tr><th>Alvorlighet</th><th>Regel</th><th>Omfang</th><th>Hvor</th></tr></thead><tbody>${ruleRows}</tbody></table>` : ''}
<h2>Alle skanninger</h2>
<table><thead><tr><th>Område</th><th>Test</th><th>Brudd</th></tr></thead><tbody>${scanRows}</tbody></table>
</html>
`;
}
