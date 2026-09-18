const fs = require('node:fs');
const path = require('node:path');

const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
const outputDir = process.argv[3] || 'jsonReports/uu-report';
if (!fs.existsSync(reportPath)) {
  console.error('Kan ikke eksportere UU-rapporter: Playwright-resultatene mangler.');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const readAttachment = (attachment) =>
  attachment.body
    ? Buffer.from(attachment.body, 'base64').toString()
    : fs.readFileSync(attachment.path, 'utf8');
const rows = [];
let reportCount = 0;
const areas = {
  accessPackageDelegation: 'Fullmakter',
  Tilgangsstyring: 'Fullmakter',
  tilgangsstyring: 'Fullmakter',
  consent: 'Samtykke',
  forespoersler: 'Forespørsler',
  innstillinger: 'Innstillinger',
  klientadministrasjon: 'Klientadministrasjon',
  maskinporten: 'Maskinporten',
  navigation: 'Aktørvalg og meny',
  systemuser: 'Systembruker',
  idporten: 'Innlogging',
};
fs.mkdirSync(outputDir, { recursive: true });
function addRow(area, title, status, filename, note = '') {
  const label = filename ? `<a href="${filename}">${escape(title)}</a>` : escape(title);
  rows.push(
    `<tr><td>${escape(area)}</td><td>${label}${note ? `<small>${escape(note)}</small>` : ''}</td><td><span class="status">${escape(status)}</span></td></tr>`,
  );
}
function visit(suite, parents = []) {
  const titles = [...parents, suite.title || ''];
  for (const spec of suite.specs || []) {
    const folder = spec.file.split('/').at(-2);
    const area = areas[folder] || folder;
    const language = [...titles, spec.title].join(' ').match(/\((NB|NN|EN)\)/)?.[1];
    for (const test of spec.tests || []) {
      const result = test.results.at(-1);
      const attachments = result?.attachments || [];
      let hasReport = false;
      for (const attachment of attachments) {
        const isCheck = attachment.name.endsWith('-uu-check');
        if (!isCheck && !attachment.name.endsWith('-uu-report')) continue;
        hasReport = true;
        const filename = `scan-${++reportCount}.html`;
        let html = readAttachment(attachment);
        let findings;
        if (isCheck) {
          const check = JSON.parse(html);
          findings = check.finding ? 1 : 0;
          html = `<!doctype html><html lang="nb"><meta charset="utf-8"><title>${escape(check.name)}</title><h1>${escape(check.name)}</h1><p>${check.finding ? 'UU-funn' : 'Bestått'}</p><pre>${escape(check.finding || '')}</pre></html>`;
        } else {
          const results = attachments.find(
            (item) => item.name === attachment.name.replace(/-uu-report$/, '-axe-results'),
          );
          if (results) findings = JSON.parse(readAttachment(results)).violations?.length;
        }
        fs.writeFileSync(path.join(outputDir, filename), html);
        const stage = attachment.name.replace(/-uu-(report|check)$/, '').replaceAll('-', ' ');
        addRow(
          area,
          spec.title,
          findings === undefined
            ? '➖ Ukjent resultat'
            : findings
              ? `❌ ${findings} funn`
              : '✅ Ingen UU-funn',
          findings === 0 ? undefined : filename,
          [language, stage === 'sluttside' ? '' : stage].filter(Boolean).join(' · '),
        );
      }
      if (!hasReport) {
        const shared = (test.annotations || []).find(({ type }) => type === 'UU-dekket-av');
        addRow(
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
  for (const child of suite.suites || []) visit(child, titles);
}
for (const suite of report.suites || []) visit(suite);
if (!rows.length) {
  console.error('Ingen tester i Playwright-rapporten.');
  process.exit(report.stats?.unexpected > 0 ? 0 : 1);
}

function renderPage(content, title = 'UU-rapporter') {
  return `<!doctype html>
<html lang="nb">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<style>
  *{box-sizing:border-box}
  body{font:18px/1.5 system-ui,sans-serif;max-width:1140px;margin:40px auto;padding:20px;color:#202c3b;background:#fff}
  h1{font-size:36px;line-height:1.2;margin:20px 0 32px}
  .table-wrap{overflow:auto}
  table{width:100%;border-collapse:collapse;text-align:left}
  caption{text-align:left;font-weight:600;padding:0 0 12px}
  th,td{padding:14px 18px;border-bottom:1px solid #d5dde5;vertical-align:top}
  th{background:#eaf1f7;font-size:16px}
  td:first-child{width:24%;font-weight:600}
  td:last-child{white-space:nowrap;font-size:15px}
  tbody tr:nth-child(even){background:#f6f8fa}
  small{display:block;color:#545e6b;font-size:13px;margin-top:6px}
  a{color:#005db1;text-underline-offset:3px}
  a:focus-visible,.table-wrap:focus-visible{outline:3px solid #0062ba;outline-offset:3px}
  .status{font-size:15px}
  td:last-child small{white-space:normal}
  @media(max-width:700px){body{margin:16px auto;padding:16px}h1{font-size:28px}table{min-width:680px}}
</style>
<main>
<h1>${escape(title)}</h1>
${content}
</main>
</html>`;
}

fs.writeFileSync(
  path.join(outputDir, 'index.html'),
  renderPage(`<div class="table-wrap" role="region" aria-label="UU-resultater" tabindex="0">
<table>
<caption>Rapporter per område og test</caption>
<thead><tr><th scope="col">Område</th><th scope="col">Test</th><th scope="col">UU-status</th></tr></thead>
<tbody>${rows.join('')}</tbody>
</table>
</div>
`),
);
console.log(
  `${rows.length} rader, ${reportCount} detaljrapporter: ${path.join(outputDir, 'index.html')}`,
);
