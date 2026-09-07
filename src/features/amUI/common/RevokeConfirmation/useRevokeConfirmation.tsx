import { useState } from 'react';

import { RevokeConfirmationDialog, type RevokedPoa } from './RevokeConfirmationDialog';

interface PendingRevoke {
  revoke: () => void;
  poa?: RevokedPoa;
}

/** Guards deletion of a poa with a confirmation dialog when it cannot be given back again. */
export const useRevokeConfirmation = () => {
  const [pending, setPending] = useState<PendingRevoke | null>(null);

  const revokeConfirmationDialog = (
    <RevokeConfirmationDialog
      open={pending !== null}
      poa={pending?.poa}
      onConfirm={() => {
        const current = pending;
        setPending(null);
        current?.revoke();
      }}
      onCancel={() => setPending(null)}
    />
  );

  /**
   * Runs `revoke` straight away when the poa can be given back; otherwise asks first. `poa` names
   * what is being deleted, so the dialog is meaningful when the surrounding list has many rows.
   */
  const confirmRevoke = (canRedelegate: boolean, revoke: () => void, poa?: RevokedPoa) => {
    if (canRedelegate) {
      revoke();
    } else {
      setPending({ revoke, poa });
    }
  };

  return { confirmRevoke, revokeConfirmationDialog };
};
