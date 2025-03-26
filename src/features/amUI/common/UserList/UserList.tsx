import { useTranslation } from 'react-i18next';
import { Button, Paragraph } from '@digdir/designsystemet-react';

import type { User } from '@/rtk/features/userInfoApi';

import { ListWrapper } from './ListWrapper';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';

export interface UserListProps {
  userList: User[];
  searchString: string;
  isLoading?: boolean;
  listItemTitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const UserList = ({ userList, searchString, isLoading, listItemTitleAs }: UserListProps) => {
  const { t } = useTranslation();
  const { users, hasNextPage, goNextPage } = useFilteredUsers({
    users: userList,
    searchString,
  });

  return (
    <>
      <Paragraph
        role='alert'
        data-size='lg'
      >
        {users.length === 0 ? t('users_page.user_no_search_result') : ''}
      </Paragraph>
      <ListWrapper
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
            variant='tertiary'
            data-size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
    </>
  );
};
