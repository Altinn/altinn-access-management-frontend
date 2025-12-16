import React from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AdvancedUserSearch.module.css';

export interface ConnectionsListProps {
  users: ExtendedUser[];
  hasNextPage: boolean;
  goNextPage: () => void;
  availableAction: DelegationAction;
  onRevoke?: (user: ExtendedUser) => void;
  onDelegate?: (user: ExtendedUser) => void;
  isActionLoading?: boolean;
  includeSelfAsChild?: boolean;
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
}) => {
  const { t } = useTranslation();

  return (
    <>
      <List spacing={2}>
        {users.map((user) => (
          <UserItem
            includeSelfAsChild={includeSelfAsChild}
            key={user.id}
            user={user}
            size='md'
            titleAs='h4'
            interactive={false}
            roleDirection='toUser'
            disableLinks
            controls={(user) => (
              <UserListActions
                isLoading={isActionLoading}
                user={user as ExtendedUser}
                availableAction={availableAction}
                onRevoke={onRevoke ? () => onRevoke(user as ExtendedUser) : undefined}
                onDelegate={onDelegate ? () => onDelegate(user as ExtendedUser) : undefined}
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
