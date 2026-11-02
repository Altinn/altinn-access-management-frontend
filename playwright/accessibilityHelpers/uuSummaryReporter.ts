import fs from 'node:fs';
import path from 'node:path';

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { AxeResults } from 'axe-core';

type Violation = AxeResults['violations'][number];

const IMPACT_LABEL: Record<string, string> = {
  critical: 'Kritisk',
  serious: 'Alvorlig',
  moderate: 'Moderat',
  minor: 'Mindre alvorlig',
};
const IMPACT_ORDER = Object.keys(IMPACT_LABEL);

/**
 * Samler axe-funnene fra alle testene til én tabell per regel, så samme feil
 * på tvers av sider blir én rad. Skrives til GitHub-oppsummeringen i CI, ellers
 * til konsollen. Detaljer og skjermbilder ligger som vedlegg på hver test i
 * Playwright-rapporten.
 */
export default class UuSummaryReporter implements Reporter {
  // Siste forsøk per test, så retries ikke telles dobbelt.
  private readonly results = new Map<string, { area: string; result: TestResult }>();

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.set(test.id, { area: path.basename(path.dirname(test.location.file)), result });
  }

  onEnd() {
    let scans = 0;
    let errors = 0;
    const rules = new Map<
      string,
      { violation: Violation; scans: number; nodes: number; areas: Set<string> }
    >();

    for (const { area, result } of this.results.values()) {
      errors += result.annotations.filter(({ type }) => type === 'UU-feil').length;
      for (const attachment of result.attachments) {
        if (!attachment.name.endsWith('-axe-results')) continue;
        const body = attachment.body ?? (attachment.path && fs.readFileSync(attachment.path));
        if (!body) continue;
        scans++;
        const { violations } = JSON.parse(body.toString()) as AxeResults;
        for (const violation of violations) {
          const rule = rules.get(violation.id) ?? {
            violation,
            scans: 0,
            nodes: 0,
            areas: new Set<string>(),
          };
          rule.scans++;
          rule.nodes += violation.nodes.length;
          rule.areas.add(area);
          rules.set(violation.id, rule);
        }
      }
    }
    if (!scans && !errors) return;

    const rows = [...rules.values()]
      .sort(
        (a, b) =>
          IMPACT_ORDER.indexOf(a.violation.impact ?? '') -
            IMPACT_ORDER.indexOf(b.violation.impact ?? '') || b.scans - a.scans,
      )
      .map(
        ({ violation, scans, nodes, areas }) =>
          `| ${IMPACT_LABEL[violation.impact ?? ''] ?? 'Ukjent'} | [${violation.help}](${violation.helpUrl}) \`${violation.id}\` | ${scans} | ${nodes} | ${[...areas].join(', ')} |`,
      );

    const summary = [
      '### UU (axe)',
      `${scans} skanninger, ${rules.size} regler med brudd, ${errors} tekniske UU-feil. Skjermbilder og detaljer ligger som vedlegg på hver test i Playwright-rapporten.`,
      ...(rows.length
        ? [
            '',
            '| Alvorlighet | Regel | Skanninger | Elementer | Områder |',
            '|---|---|---:|---:|---|',
            ...rows,
          ]
        : []),
      '',
    ].join('\n');

    if (!process.env.GITHUB_ACTIONS) {
      console.log(`\n${summary}`);
      return;
    }
    // UU skal bare varsle, aldri brekke bygget.
    try {
      if (process.env.GITHUB_STEP_SUMMARY)
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
      if (rules.size || errors) {
        const critical = [...rules.values()].filter(
          ({ violation }) => violation.impact === 'critical',
        ).length;
        // Workflow-kommando: vises som gul advarsel på kjøringen og i PR-en.
        console.log(
          `::warning title=UU-funn::${rules.size} axe-regler med brudd (${critical} kritiske) og ${errors} tekniske UU-feil i ${scans} skanninger. Se oppsummeringen av kjøringen.`,
        );
      }
    } catch (error) {
      console.warn('Kunne ikke skrive UU-oppsummering:', error);
    }
  }

  printsToStdio() {
    return false;
  }
}
