import { ListItem } from '@altinn/altinn-components';

import type { User } from '@/rtk/features/userInfoApi';

import classes from './CurrentUserPageHeader.module.css';
import { CurrentUserSkeleton } from './CurrentUserSkeleton';

interface CurrentUserPageHeaderProps {
  currentUser?: User;
  as: React.ElementType;
  loading: boolean;
}

export const CurrentUserPageHeader = ({ currentUser, as, loading }: CurrentUserPageHeaderProps) => {
  return (
    <div className={classes.currentUser}>
      {loading ? (
        <CurrentUserSkeleton />
      ) : (
        <ListItem
          size='xl'
          title={{ as: 'h2', children: currentUser?.name, size: 'xl' }}
          description={{ as: 'p', children: currentUser?.roles?.join(', ') }}
          icon={{
            type: 'person',
            name: currentUser?.name || '',
          }}
          as={as}
        />
      )}
    </div>
  );
};
