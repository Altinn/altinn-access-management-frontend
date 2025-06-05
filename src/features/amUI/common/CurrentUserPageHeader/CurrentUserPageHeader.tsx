import { ListItemBase, ListItemHeader } from '@altinn/altinn-components';

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
        <ListItemBase
          as='div'
          variant='solid'
          theme='default'
          shadow='xs'
        >
          <ListItemHeader
            size='xl'
            title={currentUser?.name}
            description={`${description.slice(0, 100)}${description.length > 100 ? '...' : ''}`}
            avatar={{
              type: 'person',
              name: currentUser?.name || '',
            }}
            as={as}
            titleAs={'h2'}
          />
        </ListItemBase>
      )}
    </div>
  );
};
