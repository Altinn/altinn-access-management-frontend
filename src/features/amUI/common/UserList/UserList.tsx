import { useTranslation } from 'react-i18next';
import { Button, DsParagraph } from '@altinn/altinn-components';

import { ListWrapper } from './ListWrapper';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';

import type { User } from '@/rtk/features/userInfoApi';

export interface UserListProps {
  userList: User[];
  searchString: string;
  isLoading?: boolean;
  listItemTitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  isAdmin?: boolean;
}

export const UserList = ({
  userList,
  searchString,
  isLoading,
  listItemTitleAs,
  isAdmin = false,
}: UserListProps) => {
  const { t } = useTranslation();
  const { users, hasNextPage, goNextPage } = useFilteredUsers({
    users: userList,
    searchString,
  });

  return (
    <>
      <DsParagraph
        role='alert'
        data-size='lg'
      >
        {users.length === 0 ? t('users_page.user_no_search_result') : ''}
      </DsParagraph>
      <ListWrapper
        isAdmin={isAdmin}
        userList={users}
        spacing={2}
        size='md'
        isLoading={isLoading}
        listItemTitleAs={listItemTitleAs}
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
