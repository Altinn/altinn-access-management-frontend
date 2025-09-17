import React from 'react';
import { List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';
import { UserListActions } from '../UserList/UserListActions';
import { DelegationAction } from '../DelegationModal/EditModal';

import classes from './AdvancedUserSearch.module.css';

export interface ConnectionsListProps {
  users: (ExtendedUser | User)[];
  isSm: boolean;
  hasNextPage: boolean;
  goNextPage: () => void;
  availableAction: DelegationAction;
  onRevoke?: (userId: string) => void;
  onDelegate?: (userId: string) => void;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({
  users,
  isSm,
  hasNextPage,
  goNextPage,
  availableAction,
  onRevoke,
  onDelegate,
}) => {
  const { t } = useTranslation();

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
            showRoles={true}
            roleDirection='toUser'
            disableLinks
            controls={
              isSm ? null : (
                <UserListActions
                  userId={user.id}
                  userName={user.name}
                  availableAction={availableAction}
                  onRevoke={onRevoke}
                  onDelegate={onDelegate}
                />
              )
            }
          />
        ))}
      </List>
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={goNextPage}
            disabled={!hasNextPage}
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
