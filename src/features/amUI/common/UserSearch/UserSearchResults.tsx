import React, { useState } from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { AccessInfoModal } from '../AccessInfoModal/AccessInfoModal';
import { InheritedStatusType, type InheritedStatusMessageType } from '../useInheritedStatus';

import classes from './UserSearch.module.css';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';
import type { UserActionTarget, UserSearchNode } from './types';

export type titleAsType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

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
  titleAs?: titleAsType;
  /**
   * On small screens, hide the inline action button and instead let the user
   * tap a row to open a modal with the access status and a labelled action.
   */
  useInfoModalOnSmallScreen?: boolean;
}

/** Build StatusSection inheritance entries from the parties a user inherits access through. */
const deriveInheritedStatus = (node: UserSearchNode): InheritedStatusMessageType[] =>
  (node.roles ?? [])
    .filter((role) => role.viaParty)
    .map((role) => ({ type: InheritedStatusType.ViaRole, via: role.viaParty }));

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
  titleAs = 'h4',
  useInfoModalOnSmallScreen = false,
}) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();
  const useInfoModal = useInfoModalOnSmallScreen && isSmall;
  const isInteractive = !!getUserLink;
  const [selectedUser, setSelectedUser] = useState<UserSearchNode | null>(null);

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
            titleAs={titleAs}
            interactive={isInteractive}
            linkTo={getUserLink ? getUserLink(user) : undefined}
            onSelect={
              useInfoModal
                ? () => setSelectedUser(user)
                : onSelect
                  ? () => onSelect({ id: user.id, name: user.name, type: user.type })
                  : undefined
            }
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
                hideOnSmallScreen={useInfoModalOnSmallScreen}
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
      {useInfoModalOnSmallScreen && (
        <AccessInfoModal
          open={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          name={selectedUser?.name ?? ''}
          userHasAccess={availableAction === DelegationAction.REVOKE}
          inheritedStatus={selectedUser ? deriveInheritedStatus(selectedUser) : undefined}
          toPartyName={selectedUser?.name}
          actions={
            selectedUser ? (
              <UserListActions
                forceFullText
                isLoading={isActionLoading}
                user={selectedUser as ExtendedUser}
                availableAction={availableAction}
                onRevoke={
                  onRevoke
                    ? () => {
                        onRevoke(selectedUser as ExtendedUser);
                        setSelectedUser(null);
                      }
                    : undefined
                }
                onDelegate={
                  onDelegate
                    ? () => {
                        onDelegate(selectedUser as ExtendedUser);
                        setSelectedUser(null);
                      }
                    : undefined
                }
                delegateLabel={delegateLabel}
                revokeLabel={revokeLabel}
              />
            ) : null
          }
        />
      )}
    </>
  );
};

export default UserSearchResults;
