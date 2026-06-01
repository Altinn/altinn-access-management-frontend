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
  onDelegate: () => void;
  onRevoke: () => void;
}

/**
 * Provides a standalone access-package action modal (give/revoke) and an `open` callback.
 * The modal is fully controlled — it renders `ClientPackageInfo` directly in a dialog (no shared
 * EditModal / DelegationModalContext), opening and closing from the `data` state. It closes itself
 * after an action.
 *
 * Render `modal` once in the component tree and call `open(data)` to show it for a given party.
 */
export const usePersonAccessModal = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<PersonAccessModalData | null>(null);

  const open = (modalData: PersonAccessModalData) => setData(modalData);
  const close = () => setData(null);

  useEffect(() => {
    if (data) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [data]);

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
            userHasAccess={data.userHasAccess}
            inheritedStatus={data.inheritedStatus}
            roleDescription={data.roleDescription}
            onDelegate={() => {
              data.onDelegate();
              close();
            }}
            onRevoke={() => {
              data.onRevoke();
              close();
            }}
          />
        )}
      </div>
    </DsDialog>
  );

  return { modal, open };
};
