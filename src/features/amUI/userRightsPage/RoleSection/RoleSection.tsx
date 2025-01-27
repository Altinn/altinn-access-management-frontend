import { useParams } from 'react-router-dom';
import { AccessPackageListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Paragraph, Heading } from '@digdir/designsystemet-react';
import { useRef, useState } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { filterDigdirAssignments } from '@/resources/utils/roleUtils';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';

import classes from './roleSection.module.css';
import { RoleInfoModal } from './RoleInfoModal';

export const RoleSection = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<Role | undefined>(undefined);

  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();
  const { data: party } = useGetPartyByUUIDQuery(rightHolderUuid ?? '');

  const { data } = useGetRolesForUserQuery({
    rightOwnerUuid: reportee?.partyUuid ?? '',
    rightHolderUuid: rightHolderUuid ?? '',
  });

  return (
    <div className={classes.roleSection}>
      <Heading
        level={2}
        size='xs'
        id='role_title'
      >
        {t('user_rights_page.roles_title')}
      </Heading>
      <Paragraph size='sm'>{t('user_rights_page.roles_description')}</Paragraph>
      <ul className={classes.roleList}>
        {data &&
          filterDigdirAssignments(data).map((assignment) => {
            return (
              <li key={assignment.id}>
                <AccessPackageListItem
                  onClick={() => {
                    setModalItem(assignment.role);
                    modalRef.current?.showModal();
                  }}
                  as='button'
                  title={assignment.role.name}
                  description={assignment.role.description}
                  size='md'
                  controls={[]}
                  id={assignment.id}
                />
              </li>
            );
          })}
      </ul>
      {party && (
        <RoleInfoModal
          modalRef={modalRef}
          toParty={party}
          role={modalItem}
          onClose={() => setModalItem(undefined)}
        />
      )}
    </div>
  );
};
