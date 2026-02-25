import React from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AdvancedUserSearch.module.css';
import { isSubUnitByType } from '@/resources/utils/reporteeUtils';

export type titleAsType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div' | 'span';

export interface ConnectionsListProps {
  users: ExtendedUser[];
  hasNextPage: boolean;
  goNextPage: () => void;
  availableAction: DelegationAction;
  onRevoke?: (user: ExtendedUser) => void;
  onDelegate?: (user: ExtendedUser) => void;
  isActionLoading?: boolean;
  includeSelfAsChild?: boolean;
  delegateLabel?: string;
  getUserLink?: (user: ExtendedUser) => string;
  titleAs?: titleAsType;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  users,
  hasNextPage,
  goNextPage,
  availableAction,
  onRevoke,
  onDelegate,
  isActionLoading = false,
  includeSelfAsChild = true,
  delegateLabel,
  getUserLink,
  titleAs = 'h4',
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
            titleAs={titleAs}
            interactive={isInteractive}
            linkTo={getUserLink ? getUserLink(user) : undefined}
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

export default ConnectionsList;
