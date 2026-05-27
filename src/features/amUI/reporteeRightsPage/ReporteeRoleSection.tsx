import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';

import { RoleInfoModal } from '../common/DelegationModal/RoleInfoModal';
import { RoleList } from '../common/RoleList/RoleList';
import { OldRolesAlert } from '../common/OldRolesAlert/OldRolesAlert';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ActionError } from '@/resources/hooks/useActionError';

interface ReporteeRoleSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({ numberOfAccesses }: ReporteeRoleSectionProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const { isLoading } = usePartyRepresentation();

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
      <RoleInfoModal
        modalRef={modalRef}
        role={modalItem}
        onClose={() => {
          setModalItem(undefined);
          setDeleteError(null);
        }}
        openWithError={deleteError as ActionError}
      />
    </>
  );
};
