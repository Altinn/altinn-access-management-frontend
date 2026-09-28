const fs = require('node:fs');
const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
if (!fs.existsSync(reportPath)) {
  console.log('Ingen Playwright-rapport ble generert.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const groups = new Map();
let scans = 0;
let uuTests = 0;
let checks = 0;
let findings = 0;
let incomplete = 0;
let errors = 0;
function visit(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const result = test.results.at(-1);
      if (!result) continue;
      errors += (test.annotations || []).filter(({ type }) => type === 'UU-feil').length;
      const group =
        (test.annotations || []).find(({ type }) => type === 'report-area')?.description ||
        'Ukjent område';
      const row = groups.get(group) || { passed: 0, failed: 0, skipped: 0 };
      const status =
        result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';
      row[status]++;
      groups.set(group, row);
      let hasScan = false;
      for (const attachment of result.attachments || []) {
        const isScan = attachment.name.endsWith('-axe-results');
        const isCheck = attachment.name.endsWith('-uu-check');
        if (!isScan && !isCheck) continue;
        const data = JSON.parse(
          attachment.body
            ? Buffer.from(attachment.body, 'base64').toString()
            : fs.readFileSync(attachment.path, 'utf8'),
        );
        if (isScan) {
          scans++;
          hasScan = true;
          findings += data.violations.length;
          incomplete += data.incomplete?.length || 0;
        } else {
          for (const check of data.checks || []) {
            checks++;
            if (check.finding) findings++;
          }
        }
      }
      if (hasScan) uuTests++;
    }
  }
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites || []) visit(suite);
const retries = [...new Set(report.config.projects.map((project) => project.retries))].join(', ');
console.log(`Playwright – retries: ${retries}.\n`);
console.log('| Område | Bestått | Feilet | Hoppet over |\n|---|---:|---:|---:|');
for (const [group, row] of groups)
  console.log(`| ${group} | ${row.passed} | ${row.failed} | ${row.skipped} |`);
const total = [...groups.values()].reduce(
  (sum, row) => ({
    passed: sum.passed + row.passed,
    failed: sum.failed + row.failed,
    skipped: sum.skipped + row.skipped,
  }),
  { passed: 0, failed: 0, skipped: 0 },
);
console.log(`| **Totalt** | **${total.passed}** | **${total.failed}** | **${total.skipped}** |`);
console.log(
  `\nUU-skanning: ${uuTests} tester, ${scans} skanninger. Dialogkontroller: ${checks}. UU-funn: ${findings}. Tekniske UU-feil: ${errors}. Krever manuell vurdering: ${incomplete} regelresultater (påvirker ikke teststatus).`,
);
