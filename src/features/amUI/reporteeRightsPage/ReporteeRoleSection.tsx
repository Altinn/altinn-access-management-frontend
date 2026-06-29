import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { RoleInfoModal } from '../common/DelegationModal/RoleInfoModal';
import { RoleList, ROLE_LIST_HEADING_ID } from '../common/RoleList/RoleList';
import { OldRolesAlert } from '../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../common/RestoreFocus';

interface ReporteeRoleSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({ numberOfAccesses }: ReporteeRoleSectionProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const { isLoading } = usePartyRepresentation();
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
          // Request focus synchronously before clearing state. If the role was deleted inside the
          // modal its row is gone, so fall back to the list heading instead of <body>.
          if (modalItem) {
            restoreFocus.requestFocus(modalItem.id, ROLE_LIST_HEADING_ID);
          }
          setModalItem(undefined);
          setDeleteError(null);
        }}
        openWithError={deleteError as ActionError}
      />
    </RestoreFocusProvider>
  );
};
