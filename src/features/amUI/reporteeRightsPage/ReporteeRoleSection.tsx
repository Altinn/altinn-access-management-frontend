import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import type { Role } from '@/rtk/features/roleApi';

import { RoleInfoModal } from '../common/DelegationModal/RoleInfoModal';
import { RoleList } from '../common/RoleList/RoleList';
import { OldRolesAlert } from '../common/OldRolesAlert/OldRolesAlert';

interface ReporteeRoleSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({ numberOfAccesses }: ReporteeRoleSectionProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  return (
    <>
      <OldRolesAlert />
      <RoleList
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
      />
      <RoleInfoModal
        modalRef={modalRef}
        role={modalItem}
        onClose={() => setModalItem(undefined)}
      />
    </>
  );
};
