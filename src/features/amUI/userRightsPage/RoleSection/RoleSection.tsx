import { useParams } from 'react-router-dom';
import { AccessPackageListItem, Heading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import { useGetRolesForUserQuery } from '@/rtk/features/roleApi';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { filterDigdirAssignments } from '@/resources/utils/roleUtils';

import classes from './roleSection.module.css';

export const RoleSection = () => {
  const { t } = useTranslation();
  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();
  const { data } = useGetRolesForUserQuery({
    rightOwnerUuid: reportee?.partyUuid ?? '',
    rightHolderUuid: rightHolderUuid ?? '',
  });

  return (
    <div className={classes.roleSection}>
      <Heading
        as='h2'
        size='md'
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
                    console.log('clicked');
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
    </div>
  );
};
