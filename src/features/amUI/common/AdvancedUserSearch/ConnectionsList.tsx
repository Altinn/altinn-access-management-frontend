import React from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AdvancedUserSearch.module.css';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

export interface ConnectionsListProps {
  users: ExtendedUser[];
  hasNextPage: boolean;
  goNextPage: () => void;
  availableAction: DelegationAction;
  onRevoke?: (user: ExtendedUser) => void;
  onDelegate?: (user: ExtendedUser) => void;
  isActionLoading?: boolean;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  users,
  hasNextPage,
  goNextPage,
  availableAction,
  onRevoke,
  onDelegate,
  isActionLoading = false,
}) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

  return (
    <>
      <List spacing={2}>
        {users.map((user) => (
          <UserItem
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
                onRevoke={onRevoke}
                onDelegate={onDelegate}
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
