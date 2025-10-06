import { useTranslation } from 'react-i18next';
import { Button, DsParagraph, List } from '@altinn/altinn-components';

import type { Connection } from '@/rtk/features/userInfoApi';

import { NewUserButton } from '../../users/NewUserModal/NewUserModal';

import { UserItem } from './UserItem';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';
import { SkeletonUserList } from './SkeletonUserList';

export interface UserListProps {
  connections?: Connection[];
  searchString: string;
  isLoading?: boolean;
  listItemTitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  interactive?: boolean;
  canAdd?: boolean;
  showRoles?: boolean;
  roleDirection?: 'toUser' | 'fromUser';
  disableLinks?: boolean;
}

export const UserList = ({
  connections,
  searchString,
  isLoading,
  listItemTitleAs,
  interactive,
  canAdd = true,
  showRoles = true,
  roleDirection = 'toUser',
  disableLinks = false,
}: UserListProps) => {
  const { t } = useTranslation();
  const { users, hasNextPage, goNextPage } = useFilteredUsers({
    connections: connections,
    searchString,
  });

  const promptForNoResults = !isLoading && users?.length === 0;

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
          {searchString.length === 0 ? (
            <>
              <DsParagraph data-size='md'>
                {canAdd ? t('users_page.only_you_have_access') : t('users_page.no_users')}
              </DsParagraph>
              {canAdd && <NewUserButton isLarge />}
            </>
          ) : (
            <>
              {canAdd ? (
                <>
                  <DsParagraph data-size='md'>
                    {t('users_page.user_no_search_result_with_add_suggestion', {
                      searchTerm: searchString,
                    })}
                  </DsParagraph>
                  <NewUserButton isLarge />
                </>
              ) : (
                <DsParagraph data-size='md'>
                  {t('users_page.user_no_search_result', { searchTerm: searchString })}
                </DsParagraph>
              )}
            </>
          )}
        </div>
      )}
      <List spacing={2}>
        {users?.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            size='md'
            titleAs={listItemTitleAs}
            interactive={interactive}
            showRoles={showRoles}
            roleDirection={roleDirection}
            disableLinks={disableLinks}
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
