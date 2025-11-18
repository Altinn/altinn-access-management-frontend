import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import type { Role } from '@/rtk/features/roleApi';

import { RoleInfoModal } from '../common/DelegationModal/RoleInfoModal';
import { RoleList } from '../common/RoleList/RoleList';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { OldRolesAlert } from '../common/OldRolesAlert/OldRolesAlert';

interface ReporteeRoleSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({ numberOfAccesses }: ReporteeRoleSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  return (
    <>
      <OldRolesAlert />
      <DsHeading
        level={2}
        data-size='2xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses ?? 0 })}
      </DsHeading>
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
