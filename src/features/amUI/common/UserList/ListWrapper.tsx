import type { FlexSpacing, ListItemSize } from '@altinn/altinn-components';
import { ListBase } from '@altinn/altinn-components';
import cn from 'classnames';

import type { User } from '@/rtk/features/userInfoApi';

import classes from './UserList.module.css';
import { UserListItem } from './UserListItem';
import { SkeletonUserList } from './SkeletonUserList';

export interface UserListProps {
  userList: User[];
  spacing?: FlexSpacing;
  size?: ListItemSize;
  indent?: boolean;
  isLoading?: boolean;
}

export const ListWrapper = ({
  userList,
  size = 'md',
  spacing,
  isLoading,
  indent,
}: UserListProps) => {
  return (
    <div className={cn(indent ? classes.indent : '')}>
      <ListBase spacing={spacing}>
        {isLoading ? (
          <SkeletonUserList />
        ) : (
          userList?.map((user) => (
            <UserListItem
              size={size}
              key={user.partyUuid}
              user={user}
            />
          ))
        )}
      </ListBase>
    </div>
  );
};
