import type { UserListItemProps } from '@altinn/altinn-components';
import { formatDate, formatDisplayName, List, UserListItem } from '@altinn/altinn-components';
import type { ElementType, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { type ExtendedUser, type User } from '@/rtk/features/userInfoApi';
import { ConnectionUserType } from '@/rtk/features/connectionApi';

import classes from './UserList.module.css';
import { displaySubConnections } from '@/resources/utils/featureFlagUtils';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import { ECC_PROVIDER_CODE, useRoleMetadata } from '../UserRoles/useRoleMetadata';

function isExtendedUser(item: ExtendedUser | User): item is ExtendedUser {
  return (item as ExtendedUser).roles !== undefined && Array.isArray((item as ExtendedUser).roles);
}

interface UserItemProps extends Pick<
  UserListItemProps,
  'size' | 'titleAs' | 'subUnit' | 'interactive' | 'shadow'
> {
  user: ExtendedUser | User;
  showRoles?: boolean;
  roleDirection?: 'toUser' | 'fromUser';
  disableLinks?: boolean;
  includeSelfAsChild?: boolean;
  linkTo?: string;
  controls?: (user: ExtendedUser | User) => ReactNode;
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
  roleDirection = 'toUser',
  subUnit = false,
  disableLinks = false,
  includeSelfAsChild = true,
  linkTo,
  shadow,
  controls,
  ...props
}: UserItemProps) => {
  const shouldDisplaySubConnections = displaySubConnections();
  const childrenToDisplay =
    user.children?.filter(
      (child) =>
        child.type === ConnectionUserType.Person || child.type === ConnectionUserType.Organization,
    ) || [];
  const hasInheritingUsers = childrenToDisplay.length > 0 && shouldDisplaySubConnections;
  const [isExpanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { mapRoles } = useRoleMetadata();
  useEffect(
    () =>
      setExpanded((hasInheritingUsers && isExtendedUser(user) && user.matchInChildren) ?? false),
    [user],
  );

  const roleNames =
    isExtendedUser(user) && user.roles
      ? mapRoles(user.roles.filter((r) => !r.viaParty))
          .filter((r) => r.provider?.code === ECC_PROVIDER_CODE)
          .map((r) => r.name)
      : [];

  const viaRoleNames =
    isExtendedUser(user) && user.roles
      ? mapRoles(user.roles.filter((r) => r.viaParty))
          .filter((r) => r.provider?.code === ECC_PROVIDER_CODE)
          .map((r) => r.name)
      : [];

  const viaEntity =
    isExtendedUser(user) && user.roles
      ? user.roles.find((r) => r.viaParty)?.viaParty?.name
      : undefined;

  const isSubOrMainUnit =
    isExtendedUser(user) &&
    user.type === ConnectionUserType.Organization &&
    user.roles?.some((role) => role.code === 'hovedenhet');

  const hasSubUnitRole = isSubOrMainUnit && roleDirection === 'fromUser';

  const description = (user: ExtendedUser | User) => {
    let descriptionString = subUnit ? '↳ ' : '';
    if (user.type === ConnectionUserType.Person) {
      const formattedDate = formatDate(user.dateOfBirth || undefined);
      descriptionString += formattedDate
        ? t('common.date_of_birth') + ' ' + formattedDate
        : undefined;
    } else if (user.type === ConnectionUserType.Organization) {
      descriptionString +=
        t('common.org_nr') +
        ' ' +
        user.organizationIdentifier +
        (isSubOrMainUnit || subUnit
          ? `, ${t(hasSubUnitRole || subUnit ? 'common.subunit_lowercase' : 'common.mainunit_lowercase')}`
          : '');
    }
    if (viaRoleNames.length > 0 && viaEntity) {
      descriptionString += ` | ${viaRoleNames.join(', ')} for ${formatDisplayName({ fullName: viaEntity, type: 'company' })}`;
    }
    if (descriptionString) {
      return descriptionString;
    }
    return undefined;
  };

  const type =
    user.type === ConnectionUserType.Person
      ? 'person'
      : user.type === ConnectionUserType.Organization
        ? 'company'
        : 'system';

  const subUsers = hasInheritingUsers
    ? includeSelfAsChild
      ? [user as User, ...(childrenToDisplay ?? [])]
      : childrenToDisplay
    : [];

  return (
    <UserListItem
      {...props}
      size={size}
      id={user.id}
      name={type !== 'system' ? formatDisplayName({ fullName: user.name, type }) : user.name}
      description={!isExpanded ? description(user) : undefined}
      roleNames={
        showRoles ? roleNames.filter((name): name is string => name !== undefined) : undefined
      }
      type={type}
      expanded={isExpanded}
      collapsible={!!hasInheritingUsers}
      interactive={!!hasInheritingUsers || interactive}
      shadow={shadow}
      linkIcon={!hasInheritingUsers && !disableLinks}
      onClick={() => {
        if (hasInheritingUsers) setExpanded(!isExpanded);
      }}
      as={
        hasInheritingUsers
          ? 'button'
          : !interactive
            ? 'div'
            : (props) => (
                <Link
                  {...props}
                  to={linkTo ?? user.id}
                />
              )
      }
      controls={!hasInheritingUsers && controls && controls(user)}
      titleAs={titleAs}
      subUnit={subUnit || hasSubUnitRole || isSubUnitByType(user.variant?.toString())}
    >
      {hasInheritingUsers && isExpanded && (
        <List
          spacing={'sm'}
          className={classes.inheritingUsers}
        >
          {subUsers.map((child, index) => (
            <UserItem
              key={child.id}
              user={{ ...child, children: null }} // do not allow further expansion of inheriting users
              size='xs'
              titleAs={userHeadingLevelForMapper(titleAs)}
              subUnit={
                (includeSelfAsChild ? index !== 0 : true) &&
                child.type === ConnectionUserType.Organization &&
                isSubUnitByType(child.variant?.toString())
              }
              roleDirection={roleDirection}
              showRoles={showRoles}
              interactive={interactive}
              disableLinks={disableLinks}
              shadow='none'
              controls={controls}
            />
          ))}
        </List>
      )}
    </UserListItem>
  );
};
