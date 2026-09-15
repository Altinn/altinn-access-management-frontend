import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichWithRegister } from '../lib/registerEnrichment';

import { RegisterApiRequests } from './RegisterApiRequests';

vi.mock('../../api-requests/Token', () => ({
  Token: class {
    getPlatformToken = vi.fn().mockResolvedValue('test-platform-token');
  },
}));
vi.mock('../../util/helper', () => ({
  env: (name: string) =>
    ({
      API_BASE_URL: 'https://platform.at23.altinn.cloud',
      ENV_NAME: 'at23',
      AT23_REGISTER_SUBSCRIPTION_KEY: 'test-key',
    })[name],
}));

const fetchMock = vi.fn();
const party = (id: string) => ({
  [id.length === 9 ? 'organizationIdentifier' : 'personIdentifier']: id,
  partyUuid: `uuid-${id}`,
  partyId: 42,
  user: { userId: 7 },
});

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('Register enrichment', () => {
  it('rejects configuration for a different environment', () => {
    expect(() => new RegisterApiRequests('at22')).toThrow('must match');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('deduplicates and batches 201 identifiers as 100, 100, 1, matching reversed responses by identifier', async () => {
    const ids = Array.from({ length: 201 }, (_, i) => String(100000000 + i));
    fetchMock.mockImplementation(async (_url, init) => ({
      ok: true,
      json: async () => ({
        data: JSON.parse(init.body)
          .data.reverse()
          .map((urn: string) => party(urn.split(':').at(-1)!)),
      }),
    }));
    const result = await new RegisterApiRequests('at23').lookup([...ids, ids[0]]);
    expect(fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).data.length)).toEqual([
      100, 100, 1,
    ]);
    expect(result.size).toBe(201);
    expect(result.get(ids[0])?.partyUuid).toBe(`uuid-${ids[0]}`);
    expect(String(fetchMock.mock.calls[0][0])).toContain('platform.at23.altinn.cloud');
    expect(fetchMock.mock.calls[0][1].headers['Ocp-Apim-Subscription-Key']).toBe('test-key');
  });

  it('preserves missing rows, duplicates and leader IDs without shifting matches', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [party('12345678901'), party('100000001')] }),
    });
    const rows = [
      { id: '100000000' },
      { id: '100000001', leader: '12345678901' },
      { id: '100000001' },
    ];
    const result = await enrichWithRegister(
      rows,
      (r) => r.id,
      'at23',
      (r) => r.leader,
    );
    expect(result.map((r) => r.altinn?.partyUuid ?? null)).toEqual([
      null,
      'uuid-100000001',
      'uuid-100000001',
    ]);
    expect(result[1].dagligLederAltinn?.user?.userId).toBe(7);
    expect(result[0].altinnEnvironment).toBe('at23');
    const urns = JSON.parse(fetchMock.mock.calls[0][1].body).data;
    expect(urns).toContain('urn:altinn:person:identifier-no:12345678901');
  });

  it('does not query empty input and rejects malformed identifiers before HTTP', async () => {
    const client = new RegisterApiRequests('at23');
    expect((await client.lookup([])).size).toBe(0);
    await expect(client.lookup(['invalid'])).rejects.toThrow('9-digit');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails on HTTP errors instead of treating them as missing parties', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    await expect(new RegisterApiRequests('at23').lookup(['100000000'])).rejects.toThrow('HTTP 403');
  });

  it('rejects malformed response shapes', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });
    await expect(new RegisterApiRequests('at23').lookup(['100000000'])).rejects.toThrow(
      'invalid party list',
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ partyUuid: 'uuid' }] }),
    });
    await expect(new RegisterApiRequests('at23').lookup(['100000000'])).rejects.toThrow(
      'requested identifier',
    );
  });
});
