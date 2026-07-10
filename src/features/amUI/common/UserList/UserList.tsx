import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsParagraph, List } from '@altinn/altinn-components';

import type { ExtendedUser } from '@/rtk/features/userInfoApi';

import { UserItem } from './UserItem';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';
import { SkeletonUserList } from './SkeletonUserList';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserListActions } from './UserListActions';
import { Connection } from '@/rtk/features/connectionApi';
import { mapConnectionsToUserSearchNodes } from '../UserSearch/connectionMapper';

export interface UserListProps {
  connections?: Connection[];
  searchString: string;
  isLoading?: boolean;
  interactive?: boolean;
  canAdd?: boolean;
  showRoles?: boolean;
  roleDirection?: 'toUser' | 'fromUser';
  disableLinks?: boolean;
  availableAction?: DelegationAction;
  onDelegate?: (userId: string) => void;
  onRevoke?: (userId: string) => void;
}

export const UserList = ({
  connections,
  searchString,
  isLoading,
  interactive,
  canAdd = true,
  showRoles = true,
  roleDirection = 'toUser',
  disableLinks = false,
  availableAction,
  onDelegate,
  onRevoke,
}: UserListProps) => {
  const { t } = useTranslation();
  const mappedUsers = useMemo(() => mapConnectionsToUserSearchNodes(connections), [connections]);
  const trimmedQuery = searchString.trim();
  const { users, hasNextPage, goNextPage } = useFilteredUsers({
    users: mappedUsers,
    searchString: trimmedQuery,
  });

  const promptForNoResults = !isLoading && users?.length === 0;
  const isSearchTermSSN = /^\d{11}$/.test(trimmedQuery);

  if (isLoading) {
    return (
      <List spacing={2}>
        <SkeletonUserList />
      </List>
    );
  }

  return (
    <>
      {promptForNoResults && (
        <div
          role='alert'
          className={classes.noResultsContent}
        >
          <DsParagraph data-size='md'>
            {canAdd && trimmedQuery.length === 0 && t('users_page.only_you_have_access')}
            {!canAdd && trimmedQuery.length === 0 && t('users_page.no_users')}
            {trimmedQuery.length > 0 &&
              t('advanced_user_search.user_no_search_result', { searchTerm: trimmedQuery })}
          </DsParagraph>
          {isSearchTermSSN ? (
            <DsParagraph data-size='md'>
              {t('advanced_user_search.no_result_help_line_ssn')}
            </DsParagraph>
          ) : (
            canAdd && (
              <DsParagraph data-size='md'>
                {t('advanced_user_search.no_result_help_line_add_user')}
              </DsParagraph>
            )
          )}
        </div>
      )}
      <List spacing={2}>
        {users?.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            size='md'
            interactive={interactive}
            showRoles={showRoles}
            roleDirection={roleDirection}
            disableLinks={disableLinks}
            controls={(user) => (
              <UserListActions
                user={user as ExtendedUser}
                availableAction={availableAction}
                onDelegate={() => onDelegate && onDelegate(user.id)}
                onRevoke={() => onRevoke && onRevoke(user.id)}
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
