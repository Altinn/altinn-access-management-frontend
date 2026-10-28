import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PartyType } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ClientAccess } from '@/rtk/features/clientApi';

import type { HeldAccessByRow } from '../ClientBulkDelegation/getClientBulkItems';

import type { ClientAccessEntry, ClientAccessResult } from './clientAccessEntry';
import { ClientAccessRows, type ClientAccessRow } from './ClientAccessRows';

vi.mock('lottie-react', () => ({ Lottie: () => null }));

vi.mock('@/resources/hooks/useProviderLogoUrl', () => ({
  useProviderLogoUrl: () => ({ getProviderLogoUrl: () => undefined }),
}));

// Labels are the translation keys, per the convention in the other component tests. Interpolation
// values are appended so assertions can tell the variants apart.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, unknown> }) =>
    values ? `${i18nKey} ${JSON.stringify(values)}` : i18nKey,
}));

const accessPackage = {
  id: 'pkg-1',
  urn: 'urn:altinn:accesspackage:regnskap',
  name: 'Regnskap',
  resources: [],
  isDelegable: true,
} as unknown as AccessPackage;

const entry: ClientAccessEntry = {
  kind: 'package',
  itemId: 'agent-1:regnskapsforer:pkg-1',
  clientId: 'client-1',
  recipient: { id: 'agent-1', name: 'Kari Nordmann', type: PartyType.Person },
  roleCode: 'regnskapsforer',
  accessId: accessPackage.urn ?? '',
  accessPackage,
  canAct: true,
};

const row: ClientAccessRow = {
  id: 'agent-1',
  name: 'Kari Nordmann',
  type: 'person',
  collapsible: true,
  entries: [entry],
};

const heldBy = (packageIds: string[]): HeldAccessByRow =>
  new Map<string, ClientAccess[]>([
    [
      'agent-1',
      [
        {
          role: { id: 'r', code: 'regnskapsforer', name: 'Regnskapsfører' },
          packages: packageIds.map((id) => ({ id, urn: `urn:${id}` })),
        } as unknown as ClientAccess,
      ],
    ],
  ]);

const runAction = vi.fn<(...args: unknown[]) => Promise<ClientAccessResult>>();

const renderRows = (props: Partial<Parameters<typeof ClientAccessRows>[0]> = {}) => {
  const view = (overrides: Partial<Parameters<typeof ClientAccessRows>[0]>) => (
    <ClientAccessRows
      rows={[row]}
      heldPackages={heldBy([])}
      heldResources={new Map()}
      heldBy='agent'
      runAction={runAction}
      expandedIds={['agent-1']}
      {...props}
      {...overrides}
    />
  );
  const result = render(view({}));
  return { ...result, rerenderWith: (overrides: typeof props) => result.rerender(view(overrides)) };
};

const giveLabel = /common\.give_poa_for/;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ClientAccessRows', () => {
  it('runs the inline action for the entry and shows a spinner while it runs', async () => {
    let resolve: (result: ClientAccessResult) => void = () => {};
    runAction.mockReturnValue(new Promise((r) => (resolve = r)));
    renderRows();

    await userEvent.click(screen.getByRole('button', { name: giveLabel }));

    expect(runAction).toHaveBeenCalledWith('delegate', entry);
    expect(screen.getByLabelText('common.loading')).toBeInTheDocument();
    resolve({ ok: true });
    expect(await screen.findByRole('button', { name: giveLabel })).toBeInTheDocument();
  });

  it('offers removal instead of delegation when the access is held', () => {
    renderRows({ heldPackages: heldBy(['pkg-1']) });

    expect(screen.queryByRole('button', { name: giveLabel })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /common\.delete_poa_for/ })).toBeInTheDocument();
  });

  it('hides the inline delegate button where delegation is not offered', () => {
    renderRows({ canDelegate: false });

    expect(screen.queryByRole('button', { name: giveLabel })).not.toBeInTheDocument();
  });

  it('opens the modal for the entry and reflects access changes live', async () => {
    const { rerenderWith } = renderRows();

    await userEvent.click(screen.getByRole('button', { name: /^Regnskap/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'common.give_poa' })).toBeInTheDocument();

    rerenderWith({ heldPackages: heldBy(['pkg-1']) });
    expect(within(dialog).getByRole('button', { name: 'common.delete_poa' })).toBeInTheDocument();
  });

  it('shows a failed modal action with the recipient as entity type', async () => {
    runAction.mockResolvedValue({
      ok: false,
      error: {
        httpStatus: '400',
        timestamp: '2026-10-27T12:00:00Z',
        details: { errorCode: 'AM.VLD-00028' },
      },
    });
    renderRows();

    await userEvent.click(screen.getByRole('button', { name: /^Regnskap/ }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'common.give_poa' }));

    expect(runAction).toHaveBeenCalledWith('delegate', entry);
    expect(
      await within(dialog).findByText(/AM\.VLD-00028.*common\.persons_lowercase/),
    ).toBeInTheDocument();
  });
});
