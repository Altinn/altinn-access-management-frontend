import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import type { Role } from '@/rtk/features/roleApi';

import { RoleInfoModal } from '../common/RoleList/RoleInfoModal';
import { RoleList } from '../common/RoleList/RoleList';
import { DelegationAction } from '../common/DelegationModal/EditModal';

interface ReporteeRoleSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeRoleSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const toUuid = getCookie('AltinnPartyUuid');

  return (
    <>
      <Heading
        level={2}
        data-size='xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses })}
      </Heading>
      <div>
        <RoleList
          to={toUuid}
          from={reporteeUuid ?? ''}
          onSelect={(role) => {
            setModalItem(role);
            modalRef.current?.showModal();
          }}
          availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        />
      </div>
      <RoleInfoModal
        modalRef={modalRef}
        toPartyUuid={toUuid}
        fromPartyUuid={reporteeUuid ?? ''}
        role={modalItem}
        onClose={() => setModalItem(undefined)}
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
      />
    </>
  );
};
