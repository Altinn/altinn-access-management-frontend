import cn from 'classnames';
import { useMemo } from 'react';

import type { User } from '@/rtk/features/userInfoApi';

import { UserListItem } from './UserListItem';
import classes from './UserList.module.css';

interface UserListProps {
  userList: User[];
  spacing?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  indent?: boolean;
}

export const UserList = ({ userList, size, spacing, indent }: UserListProps) => {
  const sortedUsers = useMemo(() => {
    return [...userList].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [userList]);

  return (
    <ul
      className={cn(
        classes.UserList,
        classes[`spacing_${spacing || 'md'}`],
        indent ? classes.indent : '',
      )}
    >
      {sortedUsers?.map((user) => (
        <UserListItem
          size={size}
          key={user.partyUuid}
          user={user}
        />
      ))}
    </ul>
  );
};
