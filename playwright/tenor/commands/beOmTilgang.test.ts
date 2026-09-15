import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, it, vi } from 'vitest';

import { command } from './beOmTilgang';

const { write } = vi.hoisted(() => ({ write: vi.fn() }));
vi.mock('node:fs', () => ({ writeFileSync: write }));
vi.mock('playwright/util/helper', () => ({ loadEnv: vi.fn() }));
vi.mock('../client/TenorApiRequests', () => ({
  TenorApiRequests: class {
    hentVirksomheterPaginert = async () =>
      Array.from({ length: 300 }, (_, i) => ({ organisasjonsnummer: String(i) }));
    hentDagligLedere = async (orgs: string[]) =>
      orgs.map((organisasjonsnummer, i) => ({
        organisasjonsnummer,
        dagligLeder: i < 280 ? '12345678901' : null,
      }));
  },
}));
afterEach(() => vi.restoreAllMocks());
it('counts missing leaders before limiting output to the requested number', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  await command.run(['-n', '200']);
  expect(write.mock.calls[0][0]).toBe(join(tmpdir(), 'be-om-tilgang-orgs.json'));
  expect(JSON.parse(write.mock.calls[0][1])).toHaveLength(200);
  expect(error).toHaveBeenLastCalledWith(
    expect.stringContaining('(20 virksomheter manglet daglig leder).'),
  );
});
