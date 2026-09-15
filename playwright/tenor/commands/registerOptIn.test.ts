import { afterEach, expect, it, vi } from 'vitest';

import { command as facilitator } from './facilitatorOrgnr';
import { command as persons } from './personer';
import { command as organizations } from './virksomheter';

const { enrich } = vi.hoisted(() => ({ enrich: vi.fn().mockResolvedValue([{ altinn: null }]) }));
vi.mock('../lib/registerEnrichment', () => ({ enrichWithRegister: enrich }));
vi.mock('../../util/helper', () => ({ loadEnv: vi.fn() }));
vi.mock('../client/TenorApiRequests', () => ({
  TENOR_MAX_PER_PAGE: 200,
  TenorApiRequests: class {
    static bosattMyndigKql = () => 'test-query';
    hentPersoner = async () => [{ foedselsnummer: '12345678901' }];
    hentVirksomheterPaginert = async () => [{ organisasjonsnummer: '100000001', navn: 'Test AS' }];
    hentFacilitatorOrgnr = async () => ['100000001'];
    hentDagligLedere = async () => [
      { organisasjonsnummer: '100000001', dagligLeder: '12345678901' },
    ];
  },
}));
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

for (const [command, extra] of [
  [persons, []],
  [organizations, []],
  [facilitator, []],
  [facilitator, ['--dagl']],
] as const) {
  it(`${command.name} ${extra.join(' ')} only enriches when requested and emits JSON`, async () => {
    const output = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await command.run(['--env', 'at22', ...extra]);
    expect(enrich).not.toHaveBeenCalled();
    await command.run(['--env', 'at22', '--register', ...extra]);
    expect(enrich).toHaveBeenCalledOnce();
    expect(enrich.mock.calls[0][2]).toBe('at22');
    expect(JSON.parse(output.mock.calls.at(-1)![0])).toEqual([{ altinn: null }]);
  });
}
