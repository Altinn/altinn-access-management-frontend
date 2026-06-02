import { useEffect, useRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { ClientPackageInfo } from '../AccessPackages/ClientPackageInfo';
import type { InheritedStatusMessageType } from '../../useInheritedStatus';

import dialogClasses from '../DelegationModal.module.css';

export interface PersonAccessModalData {
  /** The party (person/organization) the access concerns */
  party: Party;
  /** The access package the action concerns */
  accessPackage: AccessPackage;
  /** Whether the party already has the access package */
  userHasAccess: boolean;
  /** Inherited-access status messages, when available */
  inheritedStatus?: InheritedStatusMessageType[];
  /** Optional role description, e.g. "Via role X" */
  roleDescription?: string;
  /** Give-access handler. Omit when re-delegation isn't possible (e.g. "My clients"); the modal
   *  then closes after a revoke instead of flipping to a give state. */
  onDelegate?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
  onRevoke: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
}

/**
 * Provides a standalone access-package action modal (give/revoke) and an `open` callback.
 * The modal stays open after an action, showing a loading then success state. The displayed access
 * is flipped to reflect the action taken (revoke -> no access, delegate -> has access).
 *
 * Note: kept intentionally simple — the flipped access is optimistic and not re-derived from live
 * data.
 *
 * Render `modal` once in the component tree and call `open(data)` to show it for a given party.
 */
export const usePersonAccessModal = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<PersonAccessModalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAccessOverride, setHasAccessOverride] = useState<boolean | null>(null);

  const open = (modalData: PersonAccessModalData) => {
    setData(modalData);
    setHasAccessOverride(null);
    setIsSuccess(false);
    setIsLoading(false);
  };
  const close = () => setData(null);

  useEffect(() => {
    if (data) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [data]);

  const handleError = () => {
    setIsLoading(false);
    setIsSuccess(false);
  };

  const handleDelegate = async () => {
    if (!data?.onDelegate) return;

    setIsLoading(true);
    setIsSuccess(false);
    let actionHandled = false;

    const handleSuccess = () => {
      actionHandled = true;
      setIsLoading(false);
      setIsSuccess(true);
      setHasAccessOverride(true);
      setTimeout(() => setIsSuccess(false), 2000);
    };

    const handleActionError = () => {
      actionHandled = true;
      handleError();
    };

    try {
      await data.onDelegate(handleSuccess, handleActionError);

      if (!actionHandled) {
        handleSuccess();
      }
    } catch {
      handleActionError();
    }
  };

  const handleRevoke = async () => {
    if (!data) return;

    setIsLoading(true);
    setIsSuccess(false);
    let actionHandled = false;

    const handleSuccess = () => {
      actionHandled = true;
      setIsLoading(false);
      setIsSuccess(true);

      if (data.onDelegate) {
        setHasAccessOverride(false);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        // Re-delegation isn't possible here, so close once the success animation has shown.
        setTimeout(close, 2000);
      }
    };

    const handleActionError = () => {
      actionHandled = true;
      handleError();
    };

    try {
      await data.onRevoke(handleSuccess, handleActionError);

      if (!actionHandled) {
        handleSuccess();
      }
    } catch {
      handleActionError();
    }
  };

  const modal = (
    <DsDialog
      ref={modalRef}
      className={dialogClasses.modalDialog}
      closedby='any'
      onClose={close}
    >
      <div className={dialogClasses.content}>
        {data && (
          <ClientPackageInfo
            party={data.party}
            accessPackage={data.accessPackage}
            userHasAccess={hasAccessOverride ?? data.userHasAccess}
            inheritedStatus={data.inheritedStatus}
            roleDescription={data.roleDescription}
            isLoading={isLoading}
            isSuccess={isSuccess}
            onDelegate={data.onDelegate ? handleDelegate : undefined}
            onRevoke={handleRevoke}
          />
        )}
      </div>
    </DsDialog>
  );

  return { modal, open };
};
