const fs = require('node:fs');
const path = require('node:path');

const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
const outputDir = process.argv[3] || 'jsonReports/uu-report';
if (!fs.existsSync(reportPath)) {
  console.log('Ingen Playwright-rapport ble generert.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const escape = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const links = [];
fs.mkdirSync(outputDir, { recursive: true });
function visit(suite) {
  for (const spec of suite.specs || [])
    for (const test of spec.tests || []) {
      for (const attachment of test.results.at(-1)?.attachments || []) {
        if (!attachment.name.endsWith('-uu-report')) continue;
        const filename = `scan-${links.length + 1}.html`;
        const html = attachment.body
          ? Buffer.from(attachment.body, 'base64')
          : fs.readFileSync(attachment.path);
        fs.writeFileSync(path.join(outputDir, filename), html);
        links.push(
          `<li><a href="${filename}">${escape(spec.title)} — ${escape(attachment.name.replace('-uu-report', ''))}</a></li>`,
        );
      }
    }
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites || []) visit(suite);
fs.writeFileSync(
  path.join(outputDir, 'index.html'),
  `<!doctype html><html lang="nb"><meta charset="utf-8"><title>UU-rapporter</title><style>body{font:18px system-ui;max-width:1000px;margin:40px auto;padding:20px}li{margin:16px 0}</style><h1>UU-rapporter</h1><p>${links.length} fullførte skanninger. Hver rapport viser axe-funn, elementer og skjermbilde.</p><ul>${links.join('')}</ul></html>`,
);
console.log(`${links.length} UU-rapporter: ${path.join(outputDir, 'index.html')}`);
