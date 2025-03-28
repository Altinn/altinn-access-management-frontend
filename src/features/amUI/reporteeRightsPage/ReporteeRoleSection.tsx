import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';

import { RoleInfoModal } from '../common/RoleList/RoleInfoModal';
import { RoleList } from '../common/RoleList/RoleList';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import classes from './ReporteeRightsPage.module.css';

interface ReporteeRoleSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({ numberOfAccesses }: ReporteeRoleSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();

  return (
    <div className={classes.tabContentContainer}>
      <Heading
        level={2}
        data-size='xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses })}
      </Heading>
      <RoleList
        onSelect={(role) => {
          setModalItem(role);
          modalRef.current?.showModal();
        }}
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        onActionError={(role, error) => {
          setModalItem(role);
          modalRef.current?.showModal();
          setActionError(error);
        }}
      />
      <RoleInfoModal
        modalRef={modalRef}
        role={modalItem}
        onClose={() => setModalItem(undefined)}
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
      />
    </div>
  );
};
