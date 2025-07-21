import type { FlexSpacing, ListItemSize } from '@altinn/altinn-components';
import { ListBase } from '@altinn/altinn-components';
import cn from 'classnames';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';

import classes from './UserList.module.css';
import { UserListItem } from './UserListItem';
import { SkeletonUserList } from './SkeletonUserList';

export interface UserListProps {
  users: (User | ExtendedUser)[];
  spacing?: FlexSpacing;
  size?: ListItemSize;
  indent?: boolean;
  isLoading?: boolean;
  listItemTitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  interactive?: boolean;
}

export const ListWrapper = ({
  users,
  size = 'md',
  spacing,
  isLoading,
  indent,
  listItemTitleAs,
  interactive,
}: UserListProps) => {
  return (
    <div className={cn(indent ? classes.indent : '')}>
      <ListBase spacing={spacing}>
        {isLoading ? (
          <SkeletonUserList />
        ) : (
          users?.map(
            (user) =>
              user.type !== 'Systembruker' && (
                <UserListItem
                  size={size}
                  key={user.id}
                  user={user}
                  titleAs={listItemTitleAs}
                  interactive={interactive}
                />
              ),
          )
        )}
      </ListBase>
    </div>
  );
};
