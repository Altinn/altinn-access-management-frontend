import { useState } from 'react';

import { RevokeConfirmationDialog } from './RevokeConfirmationDialog';

/** Guards deletion of a poa with a confirmation dialog when it cannot be given back again. */
export const useRevokeConfirmation = () => {
  const [pendingRevoke, setPendingRevoke] = useState<(() => void) | null>(null);

  const revokeConfirmationDialog = (
    <RevokeConfirmationDialog
      open={pendingRevoke !== null}
      onConfirm={() => {
        setPendingRevoke(null);
        pendingRevoke?.();
      }}
      onCancel={() => setPendingRevoke(null)}
    />
  );

  /** Runs `revoke` straight away when the poa can be given back; otherwise asks first. */
  const confirmRevoke = (canRedelegate: boolean, revoke: () => void) => {
    if (canRedelegate) {
      revoke();
    } else {
      setPendingRevoke(() => revoke);
    }
  };

  return { confirmRevoke, revokeConfirmationDialog };
};
