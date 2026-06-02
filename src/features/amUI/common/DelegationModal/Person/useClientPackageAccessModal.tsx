import { useEffect, useRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { ClientPackageInfo } from '../AccessPackages/ClientPackageInfo';
import type { InheritedStatusMessageType } from '../../useInheritedStatus';

import dialogClasses from '../DelegationModal.module.css';

export interface ClientPackageAccessModalData {
  /** The party (person/organization) the access concerns */
  party: Party;
  /** The access package the action concerns */
  accessPackage: AccessPackage;
  /** Whether the party already has the access package (fallback before live data resolves) */
  userHasAccess: boolean;
  /** Inherited-access status messages, when available */
  inheritedStatus?: InheritedStatusMessageType[];
  /** Optional role description, e.g. "Via role X" */
  roleDescription?: string;
  /** Give-access handler. Omit when re-delegation isn't possible (e.g. "My clients"); the modal
   *  then closes after a revoke instead of showing a give state. */
  onDelegate?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
  onRevoke: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
}

/**
 * Provides a standalone access-package action modal (give/revoke) and an `open` callback.
 * The modal stays open after an action, showing a loading then success state.
 *
 * The displayed access is NOT snapshotted: the static fields (party, package, handlers) are kept,
 * but `userHasAccess` is resolved live by the caller via `renderModal(liveHasAccess)`. This keeps
 * the modal correct after a mutation even when the row it was opened from leaves the filtered list
 * (e.g. the "has access" / "all" tabs in client administration). `openData` exposes the open item's
 * data (party + access package) so the caller can look its access state up in its unfiltered source.
 */

const animationDuration = 2000;

export const useClientPackageAccessModal = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<ClientPackageAccessModalData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const open = (modalData: ClientPackageAccessModalData) => {
    setData(modalData);
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
      setTimeout(() => setIsSuccess(false), animationDuration);
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
        setTimeout(() => setIsSuccess(false), animationDuration);
      } else {
        // Re-delegation isn't possible here, so close once the success animation has shown.
        setTimeout(close, animationDuration);
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

  const renderModal = (liveHasAccess?: boolean) => (
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
            userHasAccess={liveHasAccess ?? data.userHasAccess}
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

  return { open, openData: data, renderModal };
};
