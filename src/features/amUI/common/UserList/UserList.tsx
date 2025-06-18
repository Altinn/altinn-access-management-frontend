import { useTranslation } from 'react-i18next';
import { Button, DsParagraph } from '@altinn/altinn-components';

import type { Connection } from '@/rtk/features/userInfoApi';

import { NewUserButton } from '../../users/NewUserModal/NewUserModal';

import { ListWrapper } from './ListWrapper';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';

export interface UserListProps {
  connections?: Connection[];
  searchString: string;
  isLoading?: boolean;
  listItemTitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  interactive?: boolean;
  canAdd?: boolean;
}

export const UserList = ({
  connections,
  searchString,
  isLoading,
  listItemTitleAs,
  interactive,
  canAdd = true,
}: UserListProps) => {
  const { t } = useTranslation();
  const { users, hasNextPage, goNextPage } = useFilteredUsers({
    connections: connections,
    searchString,
  });

  const promptForNoResults = !isLoading && users?.length === 0 && canAdd;

  return (
    <>
      {promptForNoResults && (
        <div
          role='alert'
          className={classes.noResultsContent}
        >
          {searchString.length === 0 ? (
            <DsParagraph data-size='md'>{t('users_page.no_users')}</DsParagraph>
          ) : (
            <DsParagraph data-size='md'>
              {t('users_page.user_no_search_result', { searchTerm: searchString })}
            </DsParagraph>
          )}
          <NewUserButton isLarge />
        </div>
      )}
      <ListWrapper
        users={users ?? []}
        spacing={2}
        size='md'
        isLoading={isLoading}
        listItemTitleAs={listItemTitleAs}
        interactive={interactive}
      />
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={goNextPage}
            disabled={!hasNextPage}
            variant='text'
            size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
    </>
  );
};
