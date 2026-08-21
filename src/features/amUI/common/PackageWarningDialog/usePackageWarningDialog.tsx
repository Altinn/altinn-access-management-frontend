import { useState } from 'react';

import { PackageWarningDialog } from './PackageWarningDialog';
import type { PendingPackageAction } from './packageWarning';

export const usePackageWarningDialog = () => {
  const [pending, setPending] = useState<{
    action: PendingPackageAction;
    onConfirm: () => void;
  } | null>(null);

  const confirm = () => {
    const current = pending;
    setPending(null);
    current?.onConfirm();
  };

  const packageWarningDialog = (
    <PackageWarningDialog
      pending={pending?.action ?? null}
      onConfirm={confirm}
      onCancel={() => setPending(null)}
    />
  );

  return {
    confirmPackageAction: (action: PendingPackageAction, onConfirm: () => void) =>
      setPending({ action, onConfirm }),
    packageWarningDialog,
  };
};
