import { afterEach, describe, expect, it, vi } from 'vitest';

import { SystemUserCleanup } from './SystemUserCleanup';

vi.mock('playwright/api-requests/Token', () => ({
  Token: class {
    getIds = async () => ({ partyId: 123, partyUuid: 'party-uuid' });
    getPersonalTokenByPid = async () => 'personal-token';
    getEnterpriseAltinnToken = async () => 'vendor-token';
  },
}));
vi.mock('playwright/util/helper', () => ({ env: () => 'https://platform.at23.altinn.cloud' }));
afterEach(() => vi.unstubAllGlobals());
const owner = { orgNo: '123456789', pid: '12345678901' };

describe('SystemUserCleanup', () => {
  it('deletes only this test system and deletes the register entry after its users', async () => {
    const cleanup = new SystemUserCleanup();
    const system = cleanup.track(owner, '987654321', 'creation');
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options: RequestInit) => {
        calls.push(`${options.method ?? 'GET'} ${new URL(url).pathname}`);
        return options.method === 'DELETE'
          ? new Response(null, { status: 204 })
          : Response.json([
              { id: 'mine', systemId: system.id },
              { id: 'unrelated', systemId: 'another-system' },
            ]);
      }),
    );
    await cleanup.cleanup();
    expect(calls).toEqual([
      'GET /authentication/api/v1/systemuser/123',
      'DELETE /authentication/api/v1/systemuser/123/mine',
      `DELETE /authentication/api/v1/systemregister/vendor/${system.id}`,
    ]);
  });

  it('cleans up a system after partial setup, or when UI deletion already removed its users', async () => {
    const cleanup = new SystemUserCleanup();
    const system = cleanup.track(owner, '987654321', 'creation');
    const fetchMock = vi.fn(async (_url: string, options: RequestInit) =>
      options.method === 'DELETE' ? new Response(null, { status: 404 }) : Response.json([]),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(cleanup.cleanup()).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[1][0]).toContain(system.id);
  });

  it('uses the agent DELETE endpoint with partyUuid', async () => {
    const cleanup = new SystemUserCleanup();
    const system = cleanup.track(owner, '987654321', 'revisor', 'agent');
    const fetchMock = vi.fn(async (_url: string, options: RequestInit) =>
      options.method === 'DELETE'
        ? new Response(null, { status: 204 })
        : Response.json([{ id: 'agent', systemId: system.id }]),
    );
    vi.stubGlobal('fetch', fetchMock);
    await cleanup.cleanup();
    expect(fetchMock.mock.calls[1][0]).toContain(
      '/systemuser/agent/123/agent?partyuuid=party-uuid',
    );
  });

  it('continues other cleanup after an error, retains the failed system and fails the test', async () => {
    const cleanup = new SystemUserCleanup();
    const first = cleanup.track(owner, '987654321', 'first');
    const second = cleanup.track(owner, '987654321', 'second');
    const deleted: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options: RequestInit) => {
        if (options.method !== 'DELETE')
          return Response.json([
            { id: 'failed', systemId: first.id },
            { id: 'still-clean-me', systemId: first.id },
          ]);
        deleted.push(url);
        return new Response(null, { status: url.endsWith('/failed') ? 500 : 204 });
      }),
    );
    await expect(cleanup.cleanup()).rejects.toThrow('System user test data cleanup failed');
    expect(deleted.some((url) => url.endsWith('/still-clean-me'))).toBe(true);
    expect(deleted.some((url) => url.endsWith(first.id))).toBe(false);
    expect(deleted.some((url) => url.endsWith(second.id))).toBe(true);
  });

  it.each([403, 500])(
    'does not delete the register entry when listing users fails with %s',
    async (status) => {
      const cleanup = new SystemUserCleanup();
      cleanup.track(owner, '987654321', 'creation');
      const fetchMock = vi.fn(async () => new Response(null, { status }));
      vi.stubGlobal('fetch', fetchMock);
      await expect(cleanup.cleanup()).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
