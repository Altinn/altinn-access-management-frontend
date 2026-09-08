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
   * Show confirm modal if the rights cant be given back, ortherwise revokes the right
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
