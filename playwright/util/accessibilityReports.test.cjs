const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const attachment = (name, data) => ({
  name,
  body: Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)).toString('base64'),
});
const scan = (name, violations, incomplete, metadata) => [
  attachment(`${name}-axe-results`, { violations, incomplete }),
  attachment(`${name}-uu-report`, `<html>${name}</html>`),
  ...(metadata ? [attachment(`${name}-scan-metadata`, metadata)] : []),
];

function exportReports(t, specs) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uu-report-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const reportPath = path.join(dir, 'report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ config: { projects: [{ retries: 0 }] }, suites: [{ specs }] }),
  );
  execFileSync(process.execPath, [
    path.join(__dirname, 'exportAccessibilityReports.cjs'),
    reportPath,
    dir,
  ]);
  return {
    dir,
    index: fs.readFileSync(path.join(dir, 'index.html'), 'utf8'),
    summary: execFileSync(process.execPath, [path.join(__dirname, 'testSummary.cjs'), reportPath], {
      encoding: 'utf8',
    }),
  };
}

function spec(title, attachments, annotations = [], status = 'passed') {
  return {
    title,
    file: 'renamed-folder/renamed.spec.ts',
    tests: [{ annotations, results: [{ status, attachments }] }],
  };
}

test('uses explicit metadata and exposes incomplete results with a detail link', (t) => {
  const { dir, index, summary } = exportReports(t, [
    spec(
      'Renamed test (EN)',
      scan('scan', [], [{ id: 'color-contrast' }], {
        area: 'Samtykke',
        language: 'nn',
        stage: 'Før godkjenning',
      }),
      [{ type: 'report-area', description: 'Samtykke' }],
    ),
  ]);
  assert.match(index, /Samtykke/);
  assert.match(index, /nn · Før godkjenning/);
  assert.match(index, /0 brudd, 1 regel krever manuell vurdering/);
  assert.match(index, /href="scan-1.html"/);
  assert.equal(fs.readFileSync(path.join(dir, 'scan-1.html'), 'utf8'), '<html>scan</html>');
  assert.match(summary, /\| Samtykke \| 1 \| 0 \| 0 \|/);
  assert.match(summary, /Krever manuell vurdering: 1 regelresultater/);
  assert.doesNotMatch(index + summary, /renamed-folder/);
});

test('keeps detail links for clean scans and reports both violations and incomplete rules', (t) => {
  const { index, summary } = exportReports(t, [
    spec('Clean', scan('clean', [], [])),
    spec('Mixed', scan('mixed', [{ id: 'label' }], [{ id: 'color-contrast' }])),
  ]);
  assert.match(index, /href="scan-1.html">Clean/);
  assert.match(index, /Ingen automatiske funn/);
  assert.match(index, /1 brudd, 1 regel krever manuell vurdering/);
  assert.match(summary, /UU-funn: 1/);
});

test('groups skipped and failed tests by annotation and uses unknown for missing metadata', (t) => {
  const annotations = [{ type: 'report-area', description: 'Fullmakter' }];
  const { index, summary } = exportReports(t, [
    spec('Skipped', [], annotations, 'skipped'),
    spec('Failed before scan', [], annotations, 'failed'),
    spec('Old report (EN)', scan('old', [], [])),
    spec(
      'Dialog',
      [
        attachment('focus-uu-check', {
          name: 'Focus',
          metadata: { area: 'Fullmakter', language: 'nb', stage: 'Dialog' },
        }),
      ],
      annotations,
    ),
  ]);
  assert.match(summary, /\| Fullmakter \| 1 \| 1 \| 1 \|/);
  assert.match(index, /Test hoppet over/);
  assert.match(index, /Ikke skannet/);
  assert.match(index, /Ukjent område/);
  assert.match(index, /Ukjent språk/);
  assert.match(index, /nb · Dialog/);
});

test('technical scan errors are reported as warnings, not clean scans', (t) => {
  const { index, summary } = exportReports(t, [
    spec(
      'Functional test passed',
      [],
      [
        { type: 'report-area', description: 'Samtykke' },
        { type: 'UU-feil', description: 'before-approval: screenshot failed' },
      ],
    ),
  ]);
  assert.match(index, /UU-kontroll eller rapport feilet/);
  assert.match(index, /screenshot failed/);
  assert.doesNotMatch(index, /Ingen automatiske funn/);
  assert.match(summary, /Tekniske UU-feil: 1/);
  assert.match(summary, /\| Samtykke \| 1 \| 0 \| 0 \|/);
});
