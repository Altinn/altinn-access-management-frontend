import { useState, type Ref } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

import type {
  ClientAccessEntry,
  ClientAccessMode,
  ClientAccessResult,
} from '../ClientAccess/clientAccessEntry';
import { useClientAccessContext } from '../ClientAccess/ClientAccessContext';

import dialogClasses from './DelegationModal.module.css';
import { ClientPackageInfo } from './AccessPackages/ClientPackageInfo';
import { ClientResourceInfo } from './SingleRights/ClientResourceInfo';

const animationDuration = 2000;

interface ClientAccessInfoModalProps {
  ref?: Ref<HTMLDialogElement>;
  entry?: ClientAccessEntry;
  onClose?: () => void;
}

/** Details for one client access entry, with delegate/remove actions. */
export const ClientAccessInfoModal = ({ ref, entry, onClose }: ClientAccessInfoModalProps) => {
  const { runAction, hasAccess, canDelegate } = useClientAccessContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<ActionError | null>(null);

  const handleClose = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
    onClose?.();
  };

  const run = async (mode: ClientAccessMode, current: ClientAccessEntry) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    let result: ClientAccessResult;
    try {
      result = await runAction(mode, current);
    } catch (thrown) {
      result = { ok: false, error: getActionError(thrown) };
    }
    setIsLoading(false);
    if (result.ok) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), animationDuration);
    } else {
      setError(result.error ?? null);
    }
  };

  const renderInfo = (current: ClientAccessEntry) => {
    const actionProps = {
      userHasAccess: hasAccess(current),
      isLoading,
      isSuccess,
      error,
      onDelegate: current.canAct && canDelegate ? () => void run('delegate', current) : undefined,
      onRevoke: current.canAct ? () => void run('remove', current) : undefined,
    };
    return current.kind === 'package' ? (
      <ClientPackageInfo
        accessPackage={current.accessPackage}
        recipient={current.recipient}
        roleDescription={current.roleDescription}
        {...actionProps}
      />
    ) : (
      <ClientResourceInfo
        resource={current.resource}
        toPartyName={current.recipient.name}
        {...actionProps}
      />
    );
  };

  return (
    <DsDialog
      ref={ref}
      className={dialogClasses.modalDialog}
      closedby='any'
      onClose={handleClose}
    >
      <div className={dialogClasses.content}>{entry && renderInfo(entry)}</div>
    </DsDialog>
  );
};
