import React, { useRef, useState } from 'react';
import type { Role } from '@/rtk/features/roleApi';

import { RoleList } from '../../common/RoleList/RoleList';
import { RoleInfoModal } from '../../common/DelegationModal/RoleInfoModal';
import { OldRolesAlert } from '../../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

export const RoleSection = () => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const { toParty, isLoading } = usePartyRepresentation();

  return (
    <>
      <OldRolesAlert />
      <RoleList
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
        isLoading={isLoading}
      />
      {toParty && (
        <RoleInfoModal
          modalRef={modalRef}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </>
  );
};
