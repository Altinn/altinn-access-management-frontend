const fs = require('node:fs');
const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
if (!fs.existsSync(reportPath)) {
  console.log('Ingen Playwright-rapport ble generert.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const groups = new Map();
const areas = {
  accessPackageDelegation: 'Fullmakter',
  Tilgangsstyring: 'Fullmakter',
  consent: 'Samtykke',
  forespoersler: 'Forespørsler',
  innstillinger: 'Innstillinger',
  klientadministrasjon: 'Klientadministrasjon',
  maskinporten: 'Maskinporten',
  navigation: 'Aktørvalg og meny',
  systemuser: 'Systembruker',
  idporten: 'Innlogging',
};
let scans = 0;
let uuTests = 0;
let otherFailures = 0;
function visit(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      const result = test.results.at(-1);
      if (!result) continue;
      const group =
        test.projectName === 'accessibility-tests'
          ? 'UU-oversikt'
          : areas[spec.file.split('/').at(-2)] || spec.file.split('/').at(-2);
      const row = groups.get(group) || { passed: 0, failed: 0, skipped: 0 };
      const status =
        result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';
      row[status]++;
      groups.set(group, row);
      let hasScan = false;
      for (const attachment of result.attachments || []) {
        if (!attachment.name.endsWith('-axe-results')) continue;
        scans++;
        hasScan = true;
      }
      if (hasScan) uuTests++;
      if (
        status === 'failed' &&
        (result.errors || []).some((error) => !/UU-funn/.test(error.message || ''))
      )
        otherFailures++;
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
  `\nUU-skanning: ${uuTests} tester, ${scans} skanninger. Andre testfeil: ${otherFailures}.`,
);
