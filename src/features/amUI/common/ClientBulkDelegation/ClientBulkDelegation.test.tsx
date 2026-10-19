import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientBulkItem } from './getClientBulkItems';
import { ClientBulkDelegationProvider, useClientBulkDelegation } from './ClientBulkDelegation';

const openSnackbar = vi.fn();

vi.mock('@altinn/altinn-components', async () => {
  const actual = await vi.importActual('@altinn/altinn-components');
  return { ...actual, useSnackbar: () => ({ openSnackbar }) };
});

const items: ClientBulkItem[] = [
  { kind: 'package', roleCode: 'regnskapsforer', id: 'urn:lonn' },
  { kind: 'resource', roleCode: 'regnskapsforer', id: 'sykemelding' },
];

const Consumer = () => {
  const bulk = useClientBulkDelegation();
  return (
    <>
      <button onClick={() => void bulk?.start('add', 'client-1', 'Dentapro AS', items)}>
        Gi alle
      </button>
      <p>{bulk?.activeRun ? `running:${bulk.activeRun.mode}` : 'stopped'}</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.id}:{bulk?.isAccessPending('client-1', item.id) ? 'pending' : 'idle'}
          </li>
        ))}
      </ul>
    </>
  );
};

const renderProvider = (
  onDelegateItems: (clientId: string, items: ClientBulkItem[]) => Promise<number>,
) =>
  render(
    <ClientBulkDelegationProvider
      agentName='Kari'
      accessStateClients={[]}
      resourceAccessClients={[]}
      getAccessPackageById={() => undefined}
      disabled={false}
      onDelegateItems={onDelegateItems}
      onRevokeItems={vi.fn()}
    >
      <Consumer />
    </ClientBulkDelegationProvider>,
  );

beforeEach(() => {
  openSnackbar.mockClear();
});

describe('ClientBulkDelegationProvider', () => {
  it('keeps every item pending until the whole run settles', async () => {
    let resolve!: (failedCount: number) => void;
    const onDelegateItems = vi.fn(() => new Promise<number>((r) => (resolve = r)));
    renderProvider(onDelegateItems);

    fireEvent.click(screen.getByRole('button', { name: 'Gi alle' }));

    expect(onDelegateItems).toHaveBeenCalledWith('client-1', items);
    expect(screen.getByText('running:add')).toBeInTheDocument();
    expect(screen.getByText('urn:lonn:pending')).toBeInTheDocument();
    expect(screen.getByText('sykemelding:pending')).toBeInTheDocument();

    resolve(0);

    await waitFor(() => expect(screen.getByText('stopped')).toBeInTheDocument());
    expect(screen.getByText('urn:lonn:idle')).toBeInTheDocument();
    expect(screen.getByText('sykemelding:idle')).toBeInTheDocument();
  });

  it('shows a success snackbar when nothing failed', async () => {
    renderProvider(vi.fn().mockResolvedValue(0));

    fireEvent.click(screen.getByRole('button', { name: 'Gi alle' }));

    await waitFor(() => expect(openSnackbar).toHaveBeenCalledTimes(1));
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'success' }));
  });

  it('shows an error snackbar when some items failed', async () => {
    renderProvider(vi.fn().mockResolvedValue(1));

    fireEvent.click(screen.getByRole('button', { name: 'Gi alle' }));

    await waitFor(() => expect(openSnackbar).toHaveBeenCalledTimes(1));
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ color: 'danger' }));
  });
});
