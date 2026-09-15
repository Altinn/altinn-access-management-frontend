const fs = require('node:fs');
const reportPath = process.argv[2] || 'jsonReports/jsonReport.json';
if (!fs.existsSync(reportPath)) {
  console.log('Ingen Playwright-rapport ble generert.');
  process.exit(0);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const groups = new Map();
const rules = new Map();
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
const findings = {
  'svg-img-alt': 'SVG uten alternativ tekst',
  'color-contrast': 'For lav kontrast',
  'button-name': 'Knapp uten navn',
  'aria-allowed-attr': 'Ugyldig ARIA-attributt',
  'aria-required-children': 'Meny mangler påkrevde elementer',
  'document-title': 'Siden mangler tittel',
  list: 'Feil listestruktur',
  listitem: 'Listeelement uten liste',
};
const states = {
  systembruker: 'Systembruker',
  sluttside: 'Siste side',
  brukeroversikt: 'Brukeroversikt',
  delegeringsdialog: 'Dialog',
  søkeresultat: 'Søkeresultat',
  'simulert-søkefeil': 'Feilmelding',
};
const consequences = {
  'svg-img-alt': [
    'Ikoner kan leses opp uten forklaring; navn på knappen må vurderes',
    'Skjermleserbrukere',
  ],
  'color-contrast': ['Tekst kan være vanskelig å lese', 'Brukere med nedsatt syn'],
  'button-name': ['Knappens formål kan være ukjent', 'Skjermleserbrukere'],
  'aria-allowed-attr': ['Kontrollens tilstand kan formidles feil', 'Skjermleserbrukere'],
  'aria-required-children': ['Menyens struktur kan være vanskelig å forstå', 'Skjermleserbrukere'],
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
        const raw = attachment.body
          ? Buffer.from(attachment.body, 'base64').toString()
          : fs.readFileSync(attachment.path, 'utf8');
        const scan = JSON.parse(raw);
        scans++;
        hasScan = true;
        for (const violation of scan.violations) {
          const rule = rules.get(violation.id) || {
            impact: violation.impact,
            nodes: 0,
            states: new Set(),
          };
          rule.nodes += violation.nodes.length;
          rule.states.add(attachment.name.replace('-axe-results', ''));
          rules.set(violation.id, rule);
        }
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
if (rules.size) {
  console.log(
    '\n| UU-funn | Treff | Hvor | Mulig konsekvens | Berørte brukere |\n|---|---:|---|---|---|',
  );
  for (const [id, rule] of rules)
    console.log(
      `| ${findings[id] || id} | ${rule.nodes} | ${[...rule.states].map((state) => states[state] || state).join(', ')} | ${(consequences[id] || ['Må vurderes manuelt', 'Må vurderes manuelt']).join(' | ')} |`,
    );
  console.log('\nTreff kan gjelde samme element i flere skanninger.');
} else console.log('\nIngen axe-brudd i de fullførte skanningene.');
console.log(
  '\nSkanner tilgangsstyringsappen. Delegeringsflyten sjekker også dialog, søk, feilmelding og tastatur/fokus.',
);
