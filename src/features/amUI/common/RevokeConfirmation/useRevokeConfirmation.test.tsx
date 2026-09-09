import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useRevokeConfirmation } from './useRevokeConfirmation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, string> }) => (
    <>{[i18nKey, ...Object.values(values ?? {})].join(' ')}</>
  ),
}));

const RevokeTrigger = ({
  canRedelegate,
  revoke,
  poa,
}: {
  canRedelegate: boolean | (() => Promise<boolean>);
  revoke: () => void;
  poa?: { name: string; toName: string };
}) => {
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();
  const check =
    typeof canRedelegate === 'function' ? canRedelegate : () => Promise.resolve(canRedelegate);
  return (
    <>
      <button onClick={() => confirmRevoke('key', check, revoke, poa)}>trigger</button>
      {revokeConfirmationDialog}
    </>
  );
};

// DsDialog keeps its children mounted while closed, so visibility is asserted on the open state.
const dialogIsOpen = () => !!document.querySelector('dialog')?.open;

const clickTrigger = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'trigger' }));
};

describe('useRevokeConfirmation', () => {
  it('revokes immediately and shows no dialog when the poa can be given back', async () => {
    const revoke = vi.fn();
    render(
      <RevokeTrigger
        canRedelegate
        revoke={revoke}
      />,
    );

    await clickTrigger();

    await waitFor(() => expect(revoke).toHaveBeenCalledTimes(1));
    expect(dialogIsOpen()).toBe(false);
  });

  it('asks first and does not revoke when the poa cannot be given back', async () => {
    const revoke = vi.fn();
    render(
      <RevokeTrigger
        canRedelegate={false}
        revoke={revoke}
      />,
    );

    await clickTrigger();

    await waitFor(() => expect(dialogIsOpen()).toBe(true));
    expect(revoke).not.toHaveBeenCalled();
  });

  it('revokes exactly once when the user confirms', async () => {
    const revoke = vi.fn();
    render(
      <RevokeTrigger
        canRedelegate={false}
        revoke={revoke}
      />,
    );
    await clickTrigger();
    await waitFor(() => expect(dialogIsOpen()).toBe(true));

    await userEvent.click(screen.getByRole('button', { name: 'common.yes_delete' }));

    expect(revoke).toHaveBeenCalledTimes(1);
    expect(dialogIsOpen()).toBe(false);
  });

  it('names the poa and the recipient when given one', async () => {
    render(
      <RevokeTrigger
        canRedelegate={false}
        revoke={vi.fn()}
        poa={{ name: 'Regnskapsfører lønn', toName: 'Ola Nordmann' }}
      />,
    );

    await clickTrigger();

    expect(
      await screen.findByText(/revoke_confirmation\.heading_for Regnskapsfører lønn Ola Nordmann/),
    ).toBeInTheDocument();
  });

  it('ignores repeat clicks while the check is pending', async () => {
    const revoke = vi.fn();
    let resolveCheck: (value: boolean) => void = () => {};
    const check = vi.fn(() => new Promise<boolean>((resolve) => (resolveCheck = resolve)));
    render(
      <RevokeTrigger
        canRedelegate={check}
        revoke={revoke}
      />,
    );

    await clickTrigger();
    await clickTrigger();
    resolveCheck(true);

    await waitFor(() => expect(revoke).toHaveBeenCalledTimes(1));
    expect(check).toHaveBeenCalledTimes(1);
  });

  it('does not revoke when the user cancels', async () => {
    const revoke = vi.fn();
    render(
      <RevokeTrigger
        canRedelegate={false}
        revoke={revoke}
      />,
    );
    await clickTrigger();
    await waitFor(() => expect(dialogIsOpen()).toBe(true));

    await userEvent.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(revoke).not.toHaveBeenCalled();
    expect(dialogIsOpen()).toBe(false);
  });
});
