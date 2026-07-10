import React from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './UserSearch.module.css';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import type { UserActionTarget, UserSearchNode } from './types';

export interface UserSearchResultsProps {
  users: UserSearchNode[];
  hasNextPage: boolean;
  goNextPage: () => void;
  availableAction: DelegationAction;
  onRevoke?: (user: UserActionTarget) => void;
  onDelegate?: (user: UserActionTarget) => void;
  onSelect?: (user: UserActionTarget) => void;
  isActionLoading?: boolean;
  includeSelfAsChild?: boolean;
  delegateLabel?: string;
  revokeLabel?: string;
  getUserLink?: (user: UserActionTarget) => string;
}

const mapUserToActionTarget = (user: UserSearchNode | ExtendedUser | User): UserActionTarget => ({
  id: user.id,
  name: user.name,
  type: user.type,
  variant: user.variant,
  organizationIdentifier: user.organizationIdentifier,
  dateOfBirth: user.dateOfBirth,
  isInherited: 'isInherited' in user ? user.isInherited : undefined,
});

export const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  users,
  hasNextPage,
  goNextPage,
  availableAction,
  onRevoke,
  onDelegate,
  onSelect,
  isActionLoading = false,
  includeSelfAsChild = true,
  delegateLabel,
  revokeLabel,
  getUserLink,
}) => {
  const { t } = useTranslation();
  const isInteractive = !!getUserLink;

  return (
    <>
      <List spacing={2}>
        {users.map((user) => (
          <UserItem
            includeSelfAsChild={includeSelfAsChild}
            subUnit={isSubUnitByType(user?.variant)}
            key={user.id}
            user={user}
            size='md'
            interactive={isInteractive}
            linkTo={getUserLink ? getUserLink(user) : undefined}
            onSelect={onSelect ? (user) => onSelect(mapUserToActionTarget(user)) : undefined}
            roleDirection='toUser'
            disableLinks={!isInteractive}
            controls={(user) => (
              <UserListActions
                isLoading={isActionLoading}
                user={user as ExtendedUser}
                availableAction={availableAction}
                onRevoke={onRevoke ? () => onRevoke(user as ExtendedUser) : undefined}
                onDelegate={onDelegate ? () => onDelegate(user as ExtendedUser) : undefined}
                delegateLabel={delegateLabel}
                revokeLabel={revokeLabel}
              />
            )}
          />
        ))}
      </List>
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={goNextPage}
            variant='outline'
            size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
    </>
  );
};

export default UserSearchResults;
