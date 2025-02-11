import cn from 'classnames';

import type { User } from '@/rtk/features/userInfoApi';

import { UserListItem } from './UserListItem';
import classes from './UserList.module.css';
import { SkeletonUserList } from './SkeletonUserList';

export interface UserListProps {
  userList: User[];
  spacing?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  indent?: boolean;
  isLoading?: boolean;
}

export const ListWrapper = ({ userList, size, spacing, indent, isLoading }: UserListProps) => {
  return (
    <ul
      className={cn(
        classes.UserList,
        classes[`spacing_${spacing || 'md'}`],
        indent ? classes.indent : '',
      )}
    >
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
    </ul>
  );
};
