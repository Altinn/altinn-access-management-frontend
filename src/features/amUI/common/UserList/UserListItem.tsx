import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import { useState } from 'react';
import cn from 'classnames';

import type { User } from '@/rtk/features/userInfoApi';

import { UserList } from './UserList';
import classes from './UserList.module.css';

interface UserListItemProps extends ListItemProps {
  user: User;
}

export const UserListItem = ({ user, size = 'lg', ...props }: UserListItemProps) => {
  const hasInheritingUsers = user.inheritingUsers.length > 0;
  const [isExpanded, setExpanded] = useState(false);
  return (
    <li className={cn(classes.UserList, classes.spacing_md)}>
      <ListItem
        {...props}
        size={size}
        title={user.name}
        description={user.unitType}
        avatar={{
          name: user.name,
          type: user.partyType === 'Organization' ? 'company' : 'person',
        }}
        expanded={isExpanded}
        collapsible={hasInheritingUsers}
        onClick={() => {
          if (hasInheritingUsers) setExpanded(!isExpanded);
        }}
      />
      {hasInheritingUsers && isExpanded && (
        <UserList
          userList={[{ ...user, inheritingUsers: [] }, ...user.inheritingUsers]}
          size='sm'
          spacing='sm'
          indent
        />
      )}
    </li>
  );
};
