import React, { useRef, useState } from 'react';
import type { Role } from '@/rtk/features/roleApi';

import { RoleList, ROLE_LIST_HEADING_ID } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/DelegationModal/RoleInfoModal';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { ActionError } from '@/resources/hooks/useActionError';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../../common/RestoreFocus';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const { toParty, isLoading } = usePartyRepresentation();
  const restoreFocus = useRestoreFocus();

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <OldRolesAlert />
      <RestoreFocusFallback>
        <RoleList
          onSelect={(role, error) => {
            setModalItem(role);
            setDeleteError(error ?? null);
            modalRef.current?.showModal();
          }}
          isLoading={isLoading}
        />
      </RestoreFocusFallback>
      {toParty && (
        <RoleInfoModal
          modalRef={modalRef}
          role={modalItem}
          onClose={() => {
            // The confirm-deletion dialog is a nested <dialog>. Closing it can fire a spurious close
            // on this modal while it is still open. Ignore those: only treat it as a real close when
            // this dialog is actually closed.
            if (modalRef.current?.open) {
              return;
            }
            if (modalItem) {
              restoreFocus.requestFocus(modalItem.id, ROLE_LIST_HEADING_ID);
            }
            setModalItem(undefined);
            setDeleteError(null);
          }}
          openWithError={deleteError as ActionError}
        />
      )}
    </RestoreFocusProvider>
  );
};
