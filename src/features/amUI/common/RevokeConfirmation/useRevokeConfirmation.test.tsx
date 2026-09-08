import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { useRevokeConfirmation } from './useRevokeConfirmation';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey, values }: { i18nKey: string; values?: Record<string, string> }) => (
    <>{[i18nKey, ...Object.values(values ?? {})].join(' ')}</>
  ),
}));

/** Renders the hook behind a button so the dialog is mounted the way real callers mount it. */
const RevokeTrigger = ({
  canRedelegate,
  revoke,
  poa,
}: {
  canRedelegate: boolean;
  revoke: () => void;
  poa?: { name: string; toName: string };
}) => {
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();
  return (
    <>
      <button onClick={() => confirmRevoke(canRedelegate, revoke, poa)}>trigger</button>
      {revokeConfirmationDialog}
    </>
  );
};

// DsDialog keeps its children in the DOM while closed, so "no dialog shown" has to be asserted on
// the element's open state — querying for the confirm button finds it either way.
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

    expect(revoke).toHaveBeenCalledTimes(1);
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

    expect(dialogIsOpen()).toBe(true);
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
      screen.getByText(/revoke_confirmation\.heading_for Regnskapsfører lønn Ola Nordmann/),
    ).toBeInTheDocument();
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

    await userEvent.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(revoke).not.toHaveBeenCalled();
    expect(dialogIsOpen()).toBe(false);
  });
});
