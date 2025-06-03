import { ListItem } from '@altinn/altinn-components';

import type { User } from '@/rtk/features/userInfoApi';

import type { User } from '@/rtk/features/userInfoApi';

import classes from './CurrentUserPageHeader.module.css';
import { CurrentUserSkeleton } from './CurrentUserSkeleton';

interface CurrentUserPageHeaderProps {
  currentUser?: User;
  as: React.ElementType;
  loading: boolean;
}

export const CurrentUserPageHeader = ({ currentUser, as, loading }: CurrentUserPageHeaderProps) => {
  const description = currentUser?.roles?.join(', ') ?? '';

  return (
    <div className={classes.currentUser}>
      {loading ? (
        <CurrentUserSkeleton />
      ) : (
        <ListItem
          size='xl'
          title={{ as: 'h2', children: currentUser?.name, size: 'xl' }}
          description={{
            as: 'p',
            children: `${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`,
          }}
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
