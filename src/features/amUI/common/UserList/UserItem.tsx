import type { UserListItemProps } from '@altinn/altinn-components';
import { List, UserListItem } from '@altinn/altinn-components';
import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { formatDateToNorwegian } from '@/resources/utils';

import { getRoleCodesForKeyRoles } from '../UserRoles/roleUtils';

import classes from './UserList.module.css';
import { is } from 'cypress/types/bluebird';

function isExtendedUser(item: ExtendedUser | User): item is ExtendedUser {
  return (item as ExtendedUser).roles !== undefined && Array.isArray((item as ExtendedUser).roles);
}

interface UserItemProps
  extends Pick<UserListItemProps, 'size' | 'titleAs' | 'subUnit' | 'interactive'> {
  user: ExtendedUser | User;
  showRoles?: boolean;
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

export const UserItem = ({
  user,
  size = 'lg',
  titleAs,
  interactive = false,
  showRoles = true,
  ...props
}: UserItemProps) => {
  const limitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;
  const hasInheritingUsers = user.children && user.children.length > 0 && !limitedPreviewLaunch;
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
  const roleCodes = isExtendedUser(user) && user.roles ? getRoleCodesForKeyRoles(user.roles) : [];
  const isSubUnit =
    isExtendedUser(user) &&
    user.type === 'Organisasjon' &&
    user.roles?.some((role) => role.code === 'hovedenhet');
  const description = (user: ExtendedUser | User) => {
    if (user.type === 'Person') {
      const formattedDate = formatDateToNorwegian(user.keyValues?.DateOfBirth);
      return formattedDate ? t('common.date_of_birth') + ' ' + formattedDate : undefined;
    } else if (user.type === 'Organisasjon') {
      return (
        t('common.org_nr') +
        ' ' +
        user.keyValues?.OrganizationIdentifier +
        (isSubUnit ? ` (${t('common.subunit_lowercase')})` : '')
      );
    }
    return undefined;
  };

  const type =
    user.type === 'Person' ? 'person' : user.type === 'Organisasjon' ? 'company' : 'system';

  return (
    <UserListItem
      {...props}
      size={size}
      id={user.id}
      name={user.name}
      description={description(user)}
      roleNames={showRoles ? roleCodes.map((r) => t(`${r}`)) : undefined}
      type={type}
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
      subUnit={isSubUnit}
    >
      {hasInheritingUsers && isExpanded && (
        <List className={classes.inheritingUsers}>
          {user.children?.map((child) => (
            <UserItem
              key={child.id}
              user={child}
              size='sm'
              titleAs={userHeadingLevelForMapper(titleAs)}
              subUnit={child.type === 'Organization'}
            />
          ))}
        </List>
      )}
    </UserListItem>
  );
};
