import React, { useRef, useState } from 'react';
import type { Role } from '@/rtk/features/roleApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/DelegationModal/RoleInfoModal';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { ActionError } from '@/resources/hooks/useActionError';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const { toParty, isLoading } = usePartyRepresentation();

  return (
    <>
      <OldRolesAlert />
      <RoleList
        onSelect={(role, error) => {
          setModalItem(role);
          setDeleteError(error ?? null);
          modalRef.current?.showModal();
        }}
        isLoading={isLoading}
      />
      {toParty && (
        <RoleInfoModal
          modalRef={modalRef}
          role={modalItem}
          onClose={() => {
            setModalItem(undefined);
            setDeleteError(null);
          }}
          openWithError={deleteError as ActionError}
        />
      )}
    </>
  );
};
