import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AddAgentAccessPackagesFn, AddAgentResourcesFn } from '@/rtk/features/clientApi';

import type { ClientBulkItem } from './getClientBulkItems';
import { useClientAccessDelegation } from './useClientAccessDelegation';

type DispatchedAction = { type: string; payload: unknown } | (() => unknown);

const dispatch = vi.fn<(action: DispatchedAction) => unknown>();

vi.mock('@/rtk/app/hooks', () => ({ useAppDispatch: () => dispatch }));

const mutation = (impl: () => Promise<unknown> = () => Promise.resolve()) =>
  vi.fn(() => ({ unwrap: impl }));

const lonn: ClientBulkItem = { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:lonn' };
const sykefravaer: ClientBulkItem = {
  kind: 'package',
  roleCode: 'regnskapsforer',
  id: 'urn:sykefravaer',
};
const sykemelding: ClientBulkItem = {
  kind: 'resource',
  roleCode: 'revisor',
  id: 'sykemelding',
};

const invalidatedTags = () =>
  dispatch.mock.calls
    .map(([action]) => action)
    .filter((action) => typeof action !== 'function' && action.type.endsWith('invalidateTags'))
    .map((action) => (typeof action === 'function' ? undefined : action.payload));

beforeEach(() => {
  dispatch.mockReset();
  dispatch.mockImplementation((action) => (typeof action === 'function' ? [] : action));
});

describe('useClientAccessDelegation', () => {
  it('sends one call per kind, grouped by role, and invalidates once at the end', async () => {
    const addPackages = mutation();
    const addResources = mutation();
    const { result } = renderHook(() =>
      useClientAccessDelegation({
        actingPartyUuid: 'party',
        addAgentAccessPackages: addPackages as unknown as AddAgentAccessPackagesFn,
        addAgentResources: addResources as unknown as AddAgentResourcesFn,
      }),
    );

    const outcome = await result.current.delegate({ clientId: 'client-1', agentId: 'agent-1' }, [
      lonn,
      sykefravaer,
      sykemelding,
    ]);
    await outcome.refetched;

    expect(outcome.failed).toEqual([]);
    expect(addPackages).toHaveBeenCalledWith({
      from: 'client-1',
      to: 'agent-1',
      party: 'party',
      payload: { values: [{ role: 'regnskapsforer', packages: ['urn:lonn', 'urn:sykefravaer'] }] },
    });
    expect(addResources).toHaveBeenCalledWith({
      from: 'client-1',
      to: 'agent-1',
      party: 'party',
      payload: { values: [{ role: 'revisor', resources: ['sykemelding'] }] },
    });
    expect(invalidatedTags()).toEqual([
      ['agentAccessPackages', 'clientAccessPackages', 'agentResources', 'clientResources'],
    ]);
  });

  it('reports the items of a failed call and still runs the other one', async () => {
    const addPackages = mutation(() => Promise.reject(new Error('23505')));
    const addResources = mutation();
    const { result } = renderHook(() =>
      useClientAccessDelegation({
        actingPartyUuid: 'party',
        addAgentAccessPackages: addPackages as unknown as AddAgentAccessPackagesFn,
        addAgentResources: addResources as unknown as AddAgentResourcesFn,
      }),
    );

    const outcome = await result.current.delegate({ clientId: 'client-1', agentId: 'agent-1' }, [
      lonn,
      sykemelding,
    ]);

    expect(outcome.failed).toEqual([lonn]);
    expect(addResources).toHaveBeenCalledTimes(1);
    expect(invalidatedTags()).toHaveLength(1);
  });

  it('runs calls for the same client and agent one at a time', async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const addPackages = vi
      .fn()
      .mockImplementationOnce(() => ({
        unwrap: () =>
          new Promise<void>((resolve) => {
            order.push('first:start');
            releaseFirst = () => {
              order.push('first:end');
              resolve();
            };
          }),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => {
          order.push('second:start');
          return Promise.resolve();
        },
      }));
    const { result } = renderHook(() =>
      useClientAccessDelegation({
        actingPartyUuid: 'party',
        addAgentAccessPackages: addPackages,
      }),
    );
    const target = { clientId: 'client-2', agentId: 'agent-2' };

    const first = result.current.delegate(target, [lonn]);
    const second = result.current.delegate(target, [sykefravaer]);
    await vi.waitFor(() => expect(order).toEqual(['first:start']));
    releaseFirst();
    await Promise.all([first, second]);

    expect(order).toEqual(['first:start', 'first:end', 'second:start']);
  });

  it('settles refetched only after the running queries have finished', async () => {
    let finishRefetch!: () => void;
    const runningRefetch = new Promise<void>((resolve) => (finishRefetch = resolve));
    let thunkCalls = 0;
    dispatch.mockImplementation((action) =>
      typeof action === 'function' ? (thunkCalls++ === 0 ? [runningRefetch] : []) : action,
    );
    const { result } = renderHook(() =>
      useClientAccessDelegation({
        actingPartyUuid: 'party',
        addAgentAccessPackages: mutation() as unknown as AddAgentAccessPackagesFn,
      }),
    );

    const outcome = await result.current.delegate({ clientId: 'client-3', agentId: 'agent-3' }, [
      lonn,
    ]);
    let refetched = false;
    void outcome.refetched.then(() => (refetched = true));
    await Promise.resolve();
    expect(refetched).toBe(false);

    finishRefetch();
    await outcome.refetched;
    expect(refetched).toBe(true);
  });

  it('fails every item without calling the backend when the target is incomplete', async () => {
    const addPackages = mutation();
    const { result } = renderHook(() =>
      useClientAccessDelegation({
        actingPartyUuid: 'party',
        addAgentAccessPackages: addPackages as unknown as AddAgentAccessPackagesFn,
      }),
    );

    const outcome = await result.current.delegate({ clientId: 'client-1' }, [lonn]);

    expect(outcome.failed).toEqual([lonn]);
    expect(addPackages).not.toHaveBeenCalled();
    expect(invalidatedTags()).toEqual([]);
  });
});
