import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { useCanRedelegatePackage } from './useCanRedelegatePackage';
import { useCanRedelegateResource } from './useCanRedelegateResource';

const packageCheck = vi.fn();
const resourceCheck = vi.fn();
const resourceRights = vi.fn();
let isHovedadmin: boolean | undefined;

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: vi.fn(),
}));

vi.mock('@/rtk/features/userInfoApi', () => ({
  useGetIsHovedadminQuery: () => ({ data: isHovedadmin }),
}));

vi.mock('@/rtk/features/accessPackageApi', () => ({
  useLazyDelegationCheckQuery: () => [packageCheck],
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useLazyDelegationCheckQuery: () => [resourceCheck],
  useLazyGetResourceRightsQuery: () => [resourceRights],
}));

const party = (partyUuid: string) => ({ partyUuid }) as never;

// A lazy-query trigger result that resolves to `data`.
const resolved = (data: unknown) => ({ unwrap: () => Promise.resolve(data), unsubscribe: vi.fn() });

const mockParties = ({ to, self }: { to: string; self: string }) => {
  vi.mocked(usePartyRepresentation).mockReturnValue({
    actingParty: party('org'),
    fromParty: party('org'),
    toParty: party(to),
    selfParty: party(self),
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  isHovedadmin = undefined;
  packageCheck.mockReturnValue(resolved([{ package: { id: 'pkg' }, result: true }]));
  resourceCheck.mockReturnValue(resolved([{ right: { key: 'read' }, result: true }]));
  resourceRights.mockReturnValue(resolved({ directRights: [{ right: { key: 'read' } }] }));
});

describe.each([
  {
    name: 'useCanRedelegatePackage',
    run: async () => renderHook(useCanRedelegatePackage).result.current.canRedelegatePackage('pkg'),
    check: packageCheck,
  },
  {
    name: 'useCanRedelegateResource',
    run: async () =>
      renderHook(useCanRedelegateResource).result.current.canRedelegateResource('res'),
    check: resourceCheck,
  },
])('$name', ({ run, check }) => {
  it('uses the delegation check when revoking access for someone else', async () => {
    mockParties({ to: 'other', self: 'me' });

    await expect(run()).resolves.toBe(true);
    expect(check).toHaveBeenCalledTimes(1);
  });

  it('cannot redelegate its own access unless hovedadmin, regardless of the delegation check', async () => {
    mockParties({ to: 'me', self: 'me' });

    await expect(run()).resolves.toBe(false);
    expect(check).not.toHaveBeenCalled();
  });

  it('can redelegate its own access when hovedadmin', async () => {
    mockParties({ to: 'me', self: 'me' });
    isHovedadmin = true;

    await expect(run()).resolves.toBe(true);
    expect(check).not.toHaveBeenCalled();
  });
});
