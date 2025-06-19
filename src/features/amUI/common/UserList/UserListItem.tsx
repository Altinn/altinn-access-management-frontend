import type { ListItemProps } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';

import { getRoleCodesForKeyRoles } from '../UserRoles/roleUtils';

import { ListWrapper } from './ListWrapper';

function isExtendedUser(item: ExtendedUser | User): item is ExtendedUser {
  return (item as ExtendedUser).roles !== undefined && Array.isArray((item as ExtendedUser).roles);
}

interface UserListItemProps extends ListItemProps {
  user: ExtendedUser | User;
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
  const hasInheritingUsers = user.children && user.children.length > 0;
  const [isExpanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  useEffect(
    () =>
      setExpanded(
        (user.children && hasInheritingUsers && isExtendedUser(user) && user.matchInChildren) ??
          false,
      ),
    [user, hasInheritingUsers],
  );
  const roles = isExtendedUser(user) && user.roles ? getRoleCodesForKeyRoles(user.roles) : [];

  return (
    <>
      <ListItem
        {...props}
        size={size}
        title={`${user.name} ${user.keyValues?.OrganizationIdentifier && !hasInheritingUsers ? `(${user.keyValues?.OrganizationIdentifier})` : ''}`}
        description={roles.map((r) => t(`${r}`)).join(', ')}
        avatar={{
          name: user.name,
          type: user.type && user.type.toString() === 'Organisasjon' ? 'company' : 'person',
        }}
        expanded={isExpanded}
        collapsible={!!hasInheritingUsers}
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
                  to={user.id}
                />
              )
        }
        titleAs={titleAs}
      />
      {hasInheritingUsers && isExpanded && (
        <ListWrapper
          users={[{ ...user, children: [] }, ...(user.children ? user.children : [])]}
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
