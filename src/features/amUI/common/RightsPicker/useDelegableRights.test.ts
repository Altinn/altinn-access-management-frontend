import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDelegableRights } from './useDelegableRights';

const rightsMetaQuery = vi.fn();
const resourceCheckQuery = vi.fn();
const instanceCheckQuery = vi.fn();

vi.mock('../PartyRepresentationContext/PartyRepresentationContext', () => ({
  usePartyRepresentation: () => ({ actingParty: { partyUuid: 'acting-party' } }),
}));

vi.mock('@/rtk/features/singleRights/singleRightsApi', () => ({
  useGetResourceRightsMetaQuery: (...args: unknown[]) => rightsMetaQuery(...args),
  useDelegationCheckQuery: (...args: unknown[]) => resourceCheckQuery(...args),
}));

vi.mock('@/rtk/features/instanceApi', () => ({
  useInstanceDelegationCheckQuery: (...args: unknown[]) => instanceCheckQuery(...args),
}));

const idle = { data: undefined, isLoading: false, isError: false, error: undefined };

const checked = {
  data: [
    { right: { key: 'read', name: 'Les' }, result: true, reasonCodes: [] },
    { right: { key: 'sign', name: 'Signer' }, result: false, reasonCodes: ['MissingRoleAccess'] },
  ],
  isLoading: false,
  isError: false,
  error: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  rightsMetaQuery.mockReturnValue({
    data: [
      { key: 'read', name: 'Les' },
      { key: 'sign', name: 'Signer' },
    ],
    isLoading: false,
    isError: false,
    error: undefined,
  });
  resourceCheckQuery.mockReturnValue(checked);
  instanceCheckQuery.mockReturnValue(checked);
});

describe('useDelegableRights', () => {
  it('checks the actions the reportee may pass on and leaves the rest undelegable', () => {
    const { result } = renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(result.current.rights).toEqual([
      expect.objectContaining({ rightKey: 'read', checked: true, delegable: true }),
      expect.objectContaining({ rightKey: 'sign', checked: false, delegable: false }),
    ]);
    expect(result.current.errorDetails).toBeNull();
  });

  it('asks the resource delegation check when there is no instance', () => {
    renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(resourceCheckQuery).toHaveBeenCalledWith({ resourceId: 'res-1' }, { skip: false });
    expect(instanceCheckQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
  });

  it('asks the instance delegation check when there is an instance', () => {
    renderHook(() =>
      useDelegableRights({ resourceId: 'res-1', instanceUrn: 'urn:altinn:instance:i-1' }),
    );

    expect(instanceCheckQuery).toHaveBeenCalledWith(
      { party: 'acting-party', resource: 'res-1', instance: 'urn:altinn:instance:i-1' },
      { skip: false },
    );
    expect(resourceCheckQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
  });

  it('asks nothing until it is enabled', () => {
    renderHook(() => useDelegableRights({ resourceId: 'res-1', isEnabled: false }));

    expect(rightsMetaQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
    expect(resourceCheckQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
    expect(instanceCheckQuery).toHaveBeenCalledWith(expect.anything(), { skip: true });
  });

  // The four error paths below are the ones the two hooks this replaced disagreed about.
  it('reports a failing rights meta, with its trace id', () => {
    rightsMetaQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: { traceId: 'abc-123' } },
    });

    const { result } = renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(result.current.errorDetails).toMatchObject({ status: '500', traceId: 'abc-123' });
  });

  it('reports a resource that offers no actions at all', () => {
    rightsMetaQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: undefined,
    });

    const { result } = renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(result.current.errorDetails).toMatchObject({ status: 'empty response' });
    expect(result.current.rights).toEqual([]);
  });

  it('reports a failing delegation check', () => {
    resourceCheckQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 503, data: '' },
    });

    const { result } = renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(result.current.errorDetails).toMatchObject({ status: '503' });
  });

  it('reports a failing instance delegation check too', () => {
    instanceCheckQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 503, data: '' },
    });

    const { result } = renderHook(() =>
      useDelegableRights({ resourceId: 'res-1', instanceUrn: 'urn:altinn:instance:i-1' }),
    );

    expect(result.current.errorDetails).toMatchObject({ status: '503' });
  });

  it('is loading while either query is', () => {
    resourceCheckQuery.mockReturnValue({ ...idle, isLoading: true });

    const { result } = renderHook(() => useDelegableRights({ resourceId: 'res-1' }));

    expect(result.current.isLoading).toBe(true);
  });
});
