import type { UserListItemProps } from '@altinn/altinn-components';
import { List, UserListItem } from '@altinn/altinn-components';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PartyEntityType } from '@/dataObjects/dtos/Party';
import {
  formatEntityDisplayName,
  getAvatarType,
  getFormattedDateOfBirthLabel,
  formatOrgNr,
  isSubUnitByType,
} from '@/resources/utils/reporteeUtils';

import {
  ECC_PROVIDER_CODE,
  ROLE_CODES_TO_IGNORE,
  useRoleMetadata,
} from '../UserRoles/useRoleMetadata';
import { isNewUser } from '../isNewUser';
import { useRestoreFocusTarget } from '../RestoreFocus';
import type { UserSearchNode } from '../UserSearch/types';

import classes from './UserList.module.css';

interface UserItemProps extends Pick<
  UserListItemProps,
  'size' | 'subUnit' | 'interactive' | 'shadow'
> {
  user: UserSearchNode;
  showRoles?: boolean;
  roleDirection?: 'toUser' | 'fromUser';
  disableLinks?: boolean;
  includeSelfAsChild?: boolean;
  linkTo?: string;
  onSelect?: (user: UserSearchNode) => void;
  controls?: (user: UserSearchNode) => ReactNode;
}

export const UserItem = ({
  user,
  size = 'lg',
  interactive = false,
  showRoles = true,
  roleDirection = 'toUser',
  subUnit = false,
  disableLinks = false,
  includeSelfAsChild = true,
  linkTo,
  onSelect,
  shadow,
  controls,
  ...props
}: UserItemProps) => {
  // Lets a row be re-focused after the user closes the modal it opened or after an inline action
  // removes it. No-op unless an ancestor renders a <RestoreFocusProvider>. See common/RestoreFocus.
  useRestoreFocusTarget(user.id);
  const childrenToDisplay =
    user.children?.filter(
      (child) =>
        child.type === PartyEntityType.Person || child.type === PartyEntityType.Organization,
    ) || [];
  const hasInheritingUsers = childrenToDisplay.length > 0;
  const [isExpanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { mapRoles } = useRoleMetadata();
  useEffect(() => setExpanded((hasInheritingUsers && user.matchInChildren) ?? false), [user]);

  const roleNames = user.roles
    ? mapRoles(user.roles.filter((r) => !r.viaParty))
        .filter(
          (r) =>
            r.provider?.code === ECC_PROVIDER_CODE && !ROLE_CODES_TO_IGNORE.includes(r.code || ''),
        )
        .map((r) => r.name)
    : [];

  const viaRoleNames = user.roles
    ? mapRoles(user.roles.filter((r) => r.viaParty))
        .filter((r) => r.provider?.code === ECC_PROVIDER_CODE)
        .map((r) => r.name)
    : [];

  const viaEntity = user.roles?.find((r) => r.viaParty)?.viaParty;

  const isSubOrMainUnit =
    user.type === PartyEntityType.Organization &&
    user.roles?.some((role) => ROLE_CODES_TO_IGNORE.includes(role.code ?? ''));

  const hasSubUnitRole = isSubOrMainUnit && roleDirection === 'fromUser';

  const description = (user: UserSearchNode) => {
    let descriptionString = subUnit ? '↳ ' : '';
    if (user.type === PartyEntityType.Person) {
      descriptionString += getFormattedDateOfBirthLabel(user.dateOfBirth);
    } else if (user.type === PartyEntityType.Organization) {
      descriptionString +=
        t('common.org_nr') +
        ' ' +
        formatOrgNr(user.organizationIdentifier) +
        (isSubOrMainUnit || subUnit
          ? `, ${t(hasSubUnitRole || subUnit ? 'common.subunit_lowercase' : 'common.mainunit_lowercase')}`
          : '');
    }
    if (viaRoleNames.length > 0 && viaEntity) {
      descriptionString += ` | ${viaRoleNames.join(', ')} for ${formatEntityDisplayName(viaEntity)}`;
    }
    if (descriptionString) {
      return descriptionString;
    }
    return undefined;
  };

  const subUsers = hasInheritingUsers
    ? includeSelfAsChild
      ? [user, ...(childrenToDisplay ?? [])]
      : childrenToDisplay
    : [];

  return (
    <UserListItem
      {...props}
      size={size}
      id={user.id}
      name={formatEntityDisplayName(user)}
      description={!isExpanded ? description(user) : undefined}
      {...(isNewUser(user.addedAt) && {
        badge: {
          label: t('client_administration_page.new_agent_tag'),
          color: 'success' as const,
          variant: 'base' as const,
        },
      })}
      roleNames={showRoles && !isExpanded ? roleNames : []}
      type={getAvatarType(user)}
      expanded={isExpanded}
      collapsible={!!hasInheritingUsers}
      interactive={!!hasInheritingUsers || !!onSelect || interactive}
      shadow={shadow}
      linkIcon={!hasInheritingUsers && !disableLinks}
      onClick={() => {
        if (hasInheritingUsers) setExpanded(!isExpanded);
        else if (onSelect) onSelect(user);
      }}
      as={
        interactive && !hasInheritingUsers && !onSelect
          ? (props) => (
              <Link
                {...props}
                to={linkTo ?? user.id}
              />
            )
          : hasInheritingUsers || onSelect
            ? 'button'
            : 'div'
      }
      controls={!hasInheritingUsers && controls && controls(user)}
      titleAs='div'
      subUnit={subUnit || hasSubUnitRole || isSubUnitByType(user.unitType)}
      deleted={user.isDeleted}
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
              subUnit={
                (includeSelfAsChild ? index !== 0 : true) &&
                child.type === PartyEntityType.Organization &&
                isSubUnitByType(child.unitType)
              }
              roleDirection={roleDirection}
              showRoles={showRoles}
              interactive={interactive}
              disableLinks={disableLinks}
              onSelect={onSelect}
              shadow='none'
              controls={controls}
            />
          ))}
        </List>
      )}
    </UserListItem>
  );
};
