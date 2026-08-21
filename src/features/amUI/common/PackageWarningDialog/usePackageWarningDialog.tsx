import { useState } from 'react';

import { PackageWarningDialog } from './PackageWarningDialog';
import { getPackageWarning, type PendingPackageAction } from './packageWarning';

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

  // Runs `onConfirm` immediately when the package/party combination needs no warning; otherwise
  // shows the warning dialog and runs it only if the user confirms.
  const confirmPackageAction = (
    action: Omit<PendingPackageAction, 'warning'>,
    onConfirm: () => void,
  ) => {
    const warning = getPackageWarning(action.accessPackage, action.fromParty, action.toParty);
    if (warning) {
      setPending({ action: { ...action, warning }, onConfirm });
    } else {
      onConfirm();
    }
  };

  return { confirmPackageAction, packageWarningDialog };
};
