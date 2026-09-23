const fs = require('node:fs');
const path = require('node:path');

const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
const outputDir = process.argv[3] || 'jsonReports/uu-report';
if (!fs.existsSync(reportPath)) {
  console.error('Kan ikke eksportere UU-rapporter: Playwright-resultatene mangler.');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const readAttachment = (attachment) =>
  attachment.body
    ? Buffer.from(attachment.body, 'base64').toString()
    : fs.readFileSync(attachment.path, 'utf8');
// Lower rank sorts first — most actionable results at the top of the report.
const GROUPS = [
  { key: 'brudd', rank: 0, label: '❌ UU-funn (bekreftede brudd)' },
  { key: 'feil', rank: 1, label: '⚠️ UU-kontroll eller rapport feilet' },
  { key: 'manuell', rank: 2, label: '⚠️ Krever manuell vurdering' },
  { key: 'ukjent', rank: 3, label: '➖ Ukjent resultat' },
  { key: 'bestått', rank: 4, label: '✅ Bestått / ingen automatiske funn' },
  { key: 'ikke-skannet', rank: 5, label: '➖ Ikke skannet' },
];
const rows = [];
const ruleMap = new Map();
let reportCount = 0;
fs.mkdirSync(outputDir, { recursive: true });
function addRow(groupKey, area, title, status, filename, note = '') {
  rows.push({ group: groupKey, area, title, status, filename, note });
}
// The same underlying defect (e.g. a shared icon button) often shows up as one
// violation per scan point. Group by rule id so the fix-list shows distinct
// defects instead of every place they happen to occur.
function recordViolations(violations, { area, stage, title, filename }) {
  for (const violation of violations || []) {
    const rule = ruleMap.get(violation.id) || {
      help: violation.help,
      helpUrl: violation.helpUrl,
      impact: violation.impact,
      nodeCount: 0,
      occurrences: [],
    };
    rule.nodeCount += violation.nodes?.length || 0;
    rule.occurrences.push({ area, stage, title, filename });
    ruleMap.set(violation.id, rule);
  }
}
function visit(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const area =
        (test.annotations || []).find(({ type }) => type === 'report-area')?.description ||
        'Ukjent område';
      const result = test.results.at(-1);
      const attachments = result?.attachments || [];
      let hasReport = false;
      for (const error of (test.annotations || []).filter(({ type }) => type === 'UU-feil')) {
        hasReport = true;
        addRow(
          'feil',
          area,
          spec.title,
          '⚠️ UU-kontroll eller rapport feilet',
          undefined,
          error.description,
        );
      }
      for (const attachment of attachments) {
        const isCheck = attachment.name.endsWith('-uu-check');
        if (!isCheck && !attachment.name.endsWith('-uu-report')) continue;
        hasReport = true;
        const filename = `scan-${++reportCount}.html`;
        let html = readAttachment(attachment);
        let findings;
        let incomplete = 0;
        let metadata;
        if (isCheck) {
          const check = JSON.parse(html);
          findings = check.finding ? 1 : 0;
          metadata = check.metadata;
          html = `<!doctype html><html lang="nb"><meta charset="utf-8"><title>${escapeHtml(check.name)}</title><h1>${escapeHtml(check.name)}</h1><p>${check.finding ? 'UU-funn' : 'Bestått'}</p><pre>${escapeHtml(check.finding || '')}</pre></html>`;
        } else {
          const metadataAttachment = attachments.find(
            (item) => item.name === attachment.name.replace(/-uu-report$/, '-scan-metadata'),
          );
          if (metadataAttachment) metadata = JSON.parse(readAttachment(metadataAttachment));
          const results = attachments.find(
            (item) => item.name === attachment.name.replace(/-uu-report$/, '-axe-results'),
          );
          if (results) {
            const data = JSON.parse(readAttachment(results));
            findings = data.violations?.length;
            incomplete = data.incomplete?.length || 0;
            recordViolations(data.violations, {
              area: metadata?.area || area,
              stage: metadata?.stage || attachment.name.replace(/-uu-report$/, ''),
              title: spec.title,
              filename,
            });
          }
        }
        fs.writeFileSync(path.join(outputDir, filename), html);
        const stage = metadata?.stage || attachment.name.replace(/-uu-(report|check)$/, '');
        const groupKey =
          findings === undefined
            ? 'ukjent'
            : findings
              ? 'brudd'
              : incomplete
                ? 'manuell'
                : 'bestått';
        addRow(
          groupKey,
          metadata?.area || area,
          spec.title,
          findings === undefined
            ? '➖ Ukjent resultat'
            : incomplete
              ? `${findings ? '❌' : '⚠️'} ${findings} brudd, ${incomplete} ${incomplete === 1 ? 'regel' : 'regler'} krever manuell vurdering`
              : findings
                ? `❌ ${findings} funn`
                : '✅ Ingen automatiske funn',
          filename,
          [metadata?.language || 'Ukjent språk', stage === 'sluttside' ? '' : stage]
            .filter(Boolean)
            .join(' · '),
        );
      }
      if (!hasReport) {
        const shared = (test.annotations || []).find(({ type }) => type === 'UU-dekket-av');
        addRow(
          'ikke-skannet',
          area,
          spec.title,
          result?.status === 'skipped'
            ? '➖ Test hoppet over'
            : shared
              ? '↪ Felles skanning'
              : '➖ Ikke skannet',
          undefined,
          result?.status !== 'skipped' && shared ? shared.description : '',
        );
      }
    }
  }
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites || []) visit(suite);
if (!rows.length) {
  console.error('Ingen tester i Playwright-rapporten.');
  process.exit(report.stats?.unexpected > 0 ? 0 : 1);
}

const rankByKey = new Map(GROUPS.map(({ key, rank }) => [key, rank]));
// Stable sort: most actionable results (violations, then errors, then manual review) float to the top.
rows.sort((a, b) => rankByKey.get(a.group) - rankByKey.get(b.group));
const countByKey = new Map(GROUPS.map(({ key }) => [key, 0]));
for (const row of rows) countByKey.set(row.group, countByKey.get(row.group) + 1);
const summary = GROUPS.filter(({ key }) => countByKey.get(key) > 0)
  .map(({ key, label }) => `${countByKey.get(key)} ${label.replace(/^\S+\s/, '')}`)
  .join(', ');

const IMPACT_RANK = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const IMPACT_LABEL = {
  critical: 'Kritisk',
  serious: 'Alvorlig',
  moderate: 'Moderat',
  minor: 'Mindre alvorlig',
};
const rules = [...ruleMap.entries()].sort(([, a], [, b]) => {
  const impactDiff = (IMPACT_RANK[a.impact] ?? 9) - (IMPACT_RANK[b.impact] ?? 9);
  return impactDiff !== 0 ? impactDiff : b.occurrences.length - a.occurrences.length;
});

function renderPage(content, title = 'UU-rapporter') {
  return `<!doctype html>
<html lang="nb">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font:18px/1.5 system-ui,sans-serif;max-width:1140px;margin:40px auto;padding:20px;color:#202c3b;background:#fff}
  h1{font-size:36px;line-height:1.2;margin:20px 0 32px}
  h2{font-size:22px;margin:40px 0 16px}
  .table-wrap{overflow:auto}
  table{width:100%;border-collapse:collapse;text-align:left}
  caption{text-align:left;font-weight:600;padding:0 0 12px}
  th,td{padding:14px 18px;border-bottom:1px solid #d5dde5;vertical-align:top}
  th{background:#eaf1f7;font-size:16px}
  tbody tr:nth-child(even){background:#f6f8fa}
  small{display:block;color:#545e6b;font-size:13px;margin-top:6px}
  a{color:#005db1;text-underline-offset:3px}
  a:focus-visible,.table-wrap:focus-visible{outline:3px solid #0062ba;outline-offset:3px}
  .status{font-size:15px}
  .summary{font-size:16px;color:#3c4652;margin:-16px 0 24px}
  .status-table td:first-child{width:24%;font-weight:600}
  .status-table td:last-child{white-space:nowrap;font-size:15px}
  .status-table td:last-child small{white-space:normal}
  .rule-table td:first-child{width:14%;font-weight:600}
  .rule-table td:nth-child(2) small{margin-top:2px}
  .rule-table ul.places{margin:0;padding-left:20px}
  .rule-table ul.places li{margin:4px 0}
  tr.group-row th{background:#dbe6f0;font-size:15px;padding:10px 18px;border-bottom:2px solid #b7c6d6}
  @media(max-width:700px){body{margin:16px auto;padding:16px}h1{font-size:28px}table{min-width:680px}}
</style>
<main>
<h1>${escapeHtml(title)}</h1>
${content}
</main>
</html>`;
}

let previousGroup;
const tableRows = rows
  .map((row) => {
    const group = GROUPS.find(({ key }) => key === row.group);
    let groupHeader = '';
    if (row.group !== previousGroup) {
      previousGroup = row.group;
      groupHeader = `<tr class="group-row"><th colspan="3" scope="rowgroup">${escapeHtml(group.label)} (${countByKey.get(row.group)})</th></tr>`;
    }
    const label = row.filename
      ? `<a href="${row.filename}">${escapeHtml(row.title)}</a>`
      : escapeHtml(row.title);
    return `${groupHeader}<tr><td>${escapeHtml(row.area)}</td><td>${label}${row.note ? `<small>${escapeHtml(row.note)}</small>` : ''}</td><td><span class="status">${escapeHtml(row.status)}</span></td></tr>`;
  })
  .join('');

const MAX_OCCURRENCE_LINKS = 6;
const ruleTableRows = rules
  .map(([id, rule]) => {
    const places = rule.occurrences
      .slice(0, MAX_OCCURRENCE_LINKS)
      .map(
        ({ area, stage, filename }) =>
          `<li><a href="${filename}">${escapeHtml(area)}${stage ? ` – ${escapeHtml(stage)}` : ''}</a></li>`,
      )
      .join('');
    const rest = rule.occurrences.length - MAX_OCCURRENCE_LINKS;
    return `<tr><td>${IMPACT_LABEL[rule.impact] || 'Ukjent alvorlighet'}</td><td><a href="${escapeHtml(rule.helpUrl)}">${escapeHtml(rule.help)}</a><small>${escapeHtml(id)}</small></td><td>${rule.occurrences.length} ${rule.occurrences.length === 1 ? 'skanning' : 'skanninger'}, ${rule.nodeCount} ${rule.nodeCount === 1 ? 'element' : 'elementer'}</td><td><ul class="places">${places}</ul>${rest > 0 ? `<small>+ ${rest} steder til</small>` : ''}</td></tr>`;
  })
  .join('');
const ruleSection = rules.length
  ? `<h2>Samlet oversikt over tilgjengelighetsfeil</h2>
<div class="table-wrap" role="region" aria-label="Samlet oversikt over tilgjengelighetsfeil" tabindex="0">
<table class="rule-table">
<thead><tr><th scope="col">Alvorlighet</th><th scope="col">Regel</th><th scope="col">Omfang</th><th scope="col">Hvor</th></tr></thead>
<tbody>${ruleTableRows}</tbody>
</table>
</div>
<h2>Alle skanninger</h2>
`
  : '';

fs.writeFileSync(
  path.join(outputDir, 'index.html'),
  renderPage(`<p class="summary">${rows.length} rader totalt — ${summary}.</p>
${ruleSection}
<div class="table-wrap" role="region" aria-label="UU-resultater" tabindex="0">
<table class="status-table">
<caption>Rapporter per område og test, sortert etter hva som krever handling først</caption>
<thead><tr><th scope="col">Område</th><th scope="col">Test</th><th scope="col">UU-status</th></tr></thead>
<tbody>${tableRows}</tbody>
</table>
</div>
`),
);
console.log(
  `${rows.length} rader, ${reportCount} detaljrapporter: ${path.join(outputDir, 'index.html')}`,
);
