import { ListItem } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { User } from '@/rtk/features/userInfoApi';

import classes from './CurrentUserPageHeader.module.css';

interface CurrentUserPageHeaderProps {
  currentUser?: User;
  as: React.ElementType;
  loading: boolean;
}

export const CurrentUserPageHeader = ({ currentUser, as, loading }: CurrentUserPageHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.currentUser}>
      <ListItem
        loading={loading}
        size='xl'
        title={currentUser?.name || 'xxxxxxxx xxxxxxxx'}
        description={currentUser?.registryRoles.map((role) => t(`user_role.${role}`)).join(', ')}
        avatar={{
          type: 'person',
          name: currentUser?.name || 'xx',
        }}
        as={as}
      />
    </div>
  );
};
