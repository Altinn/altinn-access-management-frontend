import { ListItemBase, ListItemHeader } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/rtk/features/userInfoApi';

import { getRoleCodesForKeyRoles } from '../UserRoles/roleUtils';

import classes from './CurrentUserPageHeader.module.css';
import { CurrentUserSkeleton } from './CurrentUserSkeleton';

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
      {loading ? (
        <CurrentUserSkeleton />
      ) : (
        <ListItemBase
          as='div'
          variant='solid'
          theme='default'
          shadow='xs'
        >
          <ListItemHeader
            size='xl'
            title={currentUser?.party?.name || ''}
            description={roles.map((r) => t(`${r}`)).join(', ')}
            avatar={{
              type: 'person',
              name: currentUser?.party?.name || '',
            }}
            as={as}
            titleAs={'h2'}
          />
        </ListItemBase>
      )}
    </div>
  );
};
