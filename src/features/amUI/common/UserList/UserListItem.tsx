import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { ListWrapper } from './ListWrapper';
import type { ExtendedUser } from './useFilteredUsers';

interface UserListItemProps extends ListItemProps {
  user: ExtendedUser;
}

const userHeadingLevelForMapper = (level?: ElementType) => {
  switch (level) {
    case 'h2':
      return 'h3';
    case 'h3':
      return 'h4';
    case 'h4':
      return 'h5';
    case 'h5':
      return 'h6';
    default:
      return 'h6';
  }
};

export const UserListItem = ({
  user,
  size = 'lg',
  titleAs,
  interactive = false,
  ...props
}: UserListItemProps) => {
  const hasInheritingUsers = user.inheritingUsers?.length > 0;
  const [isExpanded, setExpanded] = useState(false);

  useEffect(
    () => setExpanded((user.matchInInheritingUsers && hasInheritingUsers) ?? false),
    [user.matchInInheritingUsers, hasInheritingUsers],
  );

  return (
    <>
      <ListItem
        {...props}
        size={size}
        title={`${user.name} ${user.organizationNumber && !hasInheritingUsers ? `(${user.organizationNumber})` : ''}`}
        description={user.roles?.join(', ') ?? ''}
        avatar={{
          name: user.name,
          type: user.partyType.toString() === 'Organization' ? 'company' : 'person',
        }}
        expanded={isExpanded}
        collapsible={hasInheritingUsers}
        interactive={interactive}
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
        titleAs={titleAs}
      />
      {hasInheritingUsers && isExpanded && (
        <ListWrapper
          userList={[{ ...user, inheritingUsers: [] }, ...user.inheritingUsers]}
          size='sm'
          spacing={1}
          indent
          listItemTitleAs={userHeadingLevelForMapper(titleAs)}
          interactive={interactive}
        />
      )}
    </>
  );
};
