import { UserListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/rtk/features/userInfoApi';
import { formatDateToNorwegian } from '@/resources/utils';

import { getRoleCodesForKeyRoles } from '../UserRoles/roleUtils';

import classes from './CurrentUserPageHeader.module.css';

interface CurrentUserPageHeaderProps {
  currentUser?: Connection;
  as: React.ElementType;
  loading: boolean;
}

export const CurrentUserPageHeader = ({ currentUser, as, loading }: CurrentUserPageHeaderProps) => {
  const { t } = useTranslation();
  const roles = currentUser?.roles ? getRoleCodesForKeyRoles(currentUser.roles) : [];

  return (
    <div className={classes.currentUser}>
      <UserListItem
        id={currentUser?.party?.id || ''}
        name={currentUser?.party?.name || ''}
        description={
          t('common.date_of_birth') +
          ` ${formatDateToNorwegian(currentUser?.party?.keyValues?.DateOfBirth)}`
        }
        roleNames={roles.map((r) => t(`${r}`))}
        type='person'
        as={as}
        titleAs='h2'
        size='xl'
        loading={loading}
      />
    </div>
  );
};
