import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import classes from './UserList.module.css';
import { ListWrapper } from './ListWrapper';
import type { ExtendedUser } from './useFilteredUsers';

interface UserListItemProps extends ListItemProps {
  user: ExtendedUser;
}

export const UserListItem = ({ user, size = 'lg', ...props }: UserListItemProps) => {
  const { t } = useTranslation();
  const hasInheritingUsers = user.inheritingUsers?.length > 0;
  const [isExpanded, setExpanded] = useState(false);

  useEffect(
    () => setExpanded((user.matchInInheritingUsers && hasInheritingUsers) ?? false),
    [user.matchInInheritingUsers, hasInheritingUsers],
  );

  return (
    <li className={cn(classes.UserList, classes.spacing_md)}>
      <ListItem
        {...props}
        size={size}
        title={user.name}
        description={user.registryRoles.map((role) => t(`user_role.${role}`)).join(', ')}
        avatar={{
          name: user.name,
          type: user.partyType === 'Organization' ? 'company' : 'person',
        }}
        expanded={isExpanded}
        collapsible={hasInheritingUsers}
        linkIcon={!hasInheritingUsers}
        onClick={() => {
          if (hasInheritingUsers) setExpanded(!isExpanded);
        }}
        as={
          hasInheritingUsers
            ? 'button'
            : (props) => (
                <Link
                  {...props}
                  to={user.partyUuid}
                />
              )
        }
      />
      {hasInheritingUsers && isExpanded && (
        <ListWrapper
          userList={[{ ...user, inheritingUsers: [] }, ...user.inheritingUsers]}
          size='sm'
          spacing={1}
          indent
        />
      )}
    </li>
  );
};
