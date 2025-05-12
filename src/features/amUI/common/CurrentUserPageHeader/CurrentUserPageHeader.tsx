import { ListItemBase, ListItemHeader } from '@altinn/altinn-components';

import classes from './CurrentUserPageHeader.module.css';
import { CurrentUserSkeleton } from './CurrentUserSkeleton';

import type { User } from '@/rtk/features/userInfoApi';

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
        <ListItemBase
          as='div'
          variant='solid'
          theme='default'
          shadow='xs'
        >
          <ListItemHeader
            size='xl'
            title={currentUser?.name}
            description={currentUser?.roles?.join(', ')}
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
