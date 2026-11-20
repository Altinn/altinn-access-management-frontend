import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { command } from './pakkeholdere';

const mocks = vi.hoisted(() => ({ connection: vi.fn(), packages: vi.fn() }));
vi.mock('playwright/util/helper', () => ({ loadEnv: vi.fn() }));
vi.mock('playwright/api-requests/EnduserConnection', () => ({
  EnduserConnection: class {
    addConnection = mocks.connection;
    addPackagePerson = mocks.packages;
  },
}));
vi.mock('playwright/api-requests/Token', () => ({
  Token: class {
    getIds = async () => ({ partyUuid: 'person-uuid', lastName: 'Test' });
    getPartyUuid = async () => 'org-uuid';
  },
}));
vi.mock('../client/TenorApiRequests', () => ({
  TenorApiRequests: class {
    static bosattMyndigKql = () => 'query';
    hentVirksomheterPaginert = async () => [{ organisasjonsnummer: '100000001', navn: 'Test AS' }];
    hentDagligLederForOrg = async () => '12345678900';
    hentPersonerPaginert = async () => [
      { foedselsnummer: '12345678901', navn: 'First' },
      { foedselsnummer: '12345678902', navn: 'Second' },
      { foedselsnummer: '12345678903', navn: 'Third' },
    ];
  },
}));
const originalExitCode = process.exitCode;
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.connection.mockReset().mockResolvedValue({});
  mocks.packages.mockReset().mockResolvedValue([]);
  process.exitCode = undefined;
});
afterEach(() => {
  process.exitCode = originalExitCode;
  vi.restoreAllMocks();
});
const run = () => command.run(['--env', 'at23', '--org', '100000001', '-n', '3', '--json']);
const result = () => JSON.parse(vi.mocked(console.log).mock.calls.at(-1)![0]);

it('prints all confirmed assignments on success without setting an error exit code', async () => {
  await run();
  expect(result().brukere.map((b: { pakker: string[] }) => b.pakker.length)).toEqual([5, 4, 3]);
  expect(result().feil).toEqual([]);
  expect(process.exitCode).toBeUndefined();
});

it('preserves successful users and continues after a failed connection', async () => {
  mocks.connection.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('connection failed'));
  await run();
  expect(result().brukere.map((b: { foedselsnummer: string }) => b.foedselsnummer)).toEqual([
    '12345678901',
    '12345678903',
  ]);
  expect(result().feil).toEqual([
    {
      foedselsnummer: '12345678902',
      tilkoblingBekreftet: false,
      steg: 'tilkobling',
      melding: 'connection failed',
    },
  ]);
  expect(mocks.packages.mock.calls.some((call) => call[2] === '12345678902')).toBe(false);
  expect(process.exitCode).toBe(1);
});

it('records the connection and earlier packages when a later package fails', async () => {
  mocks.packages.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('package failed'));
  await run();
  expect(result().brukere).toHaveLength(3);
  expect(result().brukere[0].pakker).toEqual(['urn:altinn:accesspackage:posttjenester']);
  expect(result().brukere[2].pakker).toHaveLength(3);
  expect(result().feil).toEqual([
    {
      foedselsnummer: '12345678901',
      tilkoblingBekreftet: true,
      steg: 'pakke',
      pakke: 'urn:altinn:accesspackage:byggesoknad',
      melding: 'package failed',
    },
  ]);
  expect(process.exitCode).toBe(1);
});
