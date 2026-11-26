import { useRef, useState } from 'react';

import { RevokeConfirmationDialog, type RevokedPoa } from './RevokeConfirmationDialog';

interface PendingRevoke {
  revoke: () => void;
  poa?: RevokedPoa;
}

export const useRevokeConfirmation = () => {
  const [pending, setPending] = useState<PendingRevoke | null>(null);
  const awaitingCheck = useRef<Set<string>>(new Set());

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

  // Runs `revoke` immediately when the poa can be given back again; otherwise shows the dialog and
  // runs it only if the user confirms. Repeat clicks on `key` are ignored while the check runs
  // instead of disabling the trigger, since disabling would blur it and lose focus on cancel.
  const confirmRevoke = async (
    key: string,
    canRedelegate: () => Promise<boolean>,
    revoke: () => void,
    poa?: RevokedPoa,
  ) => {
    if (awaitingCheck.current.has(key)) return;
    awaitingCheck.current.add(key);
    try {
      if (await canRedelegate()) {
        revoke();
      } else {
        setPending({ revoke, poa });
      }
    } finally {
      awaitingCheck.current.delete(key);
    }
  };

  return { confirmRevoke, revokeConfirmationDialog };
};
