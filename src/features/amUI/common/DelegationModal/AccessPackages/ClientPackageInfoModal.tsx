import { forwardRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import type { InheritedStatusMessageType } from '../../useInheritedStatus';
import dialogClasses from '../DelegationModal.module.css';

import { ClientPackageInfo } from './ClientPackageInfo';

const animationDuration = 2000;

export interface ClientPackageModalData {
  /** The party (person/organization) the access concerns */
  party: Party;
  /** The access package the action concerns */
  accessPackage: AccessPackage;
  /** Whether the party already has the access package. Resolve this live from the caller's
   *  unfiltered access state so it stays correct after a mutation. */
  userHasAccess: boolean;
  /** Inherited-access status messages, when available */
  inheritedStatus?: InheritedStatusMessageType[];
  /** Optional role description, e.g. "Via role X" */
  roleDescription?: string;
  /** Give-access handler. Omit when re-delegation isn't possible (e.g. "My clients"); the modal
   *  then simply shows no give button after a revoke. */
  onDelegate?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
  onRevoke: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
}

interface ClientPackageInfoModalProps {
  /** The open item's data. Build it live each render so `userHasAccess` reflects mutations. */
  data?: ClientPackageModalData;
  onClose?: () => void;
}

/**
 * Standalone give/revoke modal for an access package (client administration).
 *
 * Controlled from the outside like the other modals: the parent owns the `ref` (open via
 * `ref.current?.showModal()`) and the selected item, and rebuilds `data` each render so the
 * displayed access stays live after a mutation. This component owns only the action lifecycle
 * (loading -> success), keeping the modal open through it; the available buttons are derived from
 * the live access state and the presence of `onDelegate`.
 */
export const ClientPackageInfoModal = forwardRef<HTMLDialogElement, ClientPackageInfoModalProps>(
  ({ data, onClose }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleError = () => {
      setIsLoading(false);
      setIsSuccess(false);
    };

    const handleClose = () => {
      setIsLoading(false);
      setIsSuccess(false);
      onClose?.();
    };

    const runAction = async (
      action: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>,
    ) => {
      setIsLoading(true);
      setIsSuccess(false);
      let actionHandled = false;

      const handleSuccess = () => {
        actionHandled = true;
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), animationDuration);
      };

      const handleActionError = () => {
        actionHandled = true;
        handleError();
      };

      try {
        await action(handleSuccess, handleActionError);

        if (!actionHandled) {
          handleSuccess();
        }
      } catch {
        handleActionError();
      }
    };

    return (
      <DsDialog
        ref={ref}
        className={dialogClasses.modalDialog}
        closedby='any'
        onClose={handleClose}
      >
        <div className={dialogClasses.content}>
          {data && (
            <ClientPackageInfo
              party={data.party}
              accessPackage={data.accessPackage}
              userHasAccess={data.userHasAccess}
              inheritedStatus={data.inheritedStatus}
              roleDescription={data.roleDescription}
              isLoading={isLoading}
              isSuccess={isSuccess}
              onDelegate={data.onDelegate ? () => runAction(data.onDelegate!) : undefined}
              onRevoke={() => runAction(data.onRevoke)}
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

ClientPackageInfoModal.displayName = 'ClientPackageInfoModal';
