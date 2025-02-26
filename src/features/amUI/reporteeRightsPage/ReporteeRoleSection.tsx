import { Heading } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { RoleList } from '../common/RoleList/RoleList';
import { RoleInfoModal } from '../common/RoleList/RoleInfoModal';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import type { Role } from '@/rtk/features/roleApi';

interface ReporteeRoleSectionProps {
  reporteeUuid?: string;
  numberOfAccesses?: number;
}

export const ReporteeRoleSection = ({
  numberOfAccesses,
  reporteeUuid,
}: ReporteeRoleSectionProps) => {
  const { t } = useTranslation();
  const { id: rightHolderUuid } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');

  return (
    <>
      <Heading
        level={2}
        size='xs'
        id='access_packages_title'
      >
        {t('role.current_roles_title', { count: numberOfAccesses })}
      </Heading>
      <div>
        <RoleList
          from={reporteeUuid ?? ''}
          to={getCookie('AltinnPartyUuid')}
          onSelect={(role) => console.log(role)}
        />
      </div>
      {party && (
        <RoleInfoModal
          modalRef={modalRef}
          toParty={party}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </>
  );
};
