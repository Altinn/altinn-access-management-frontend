import { Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { Paragraph } from '@digdir/designsystemet-react';

import type { User } from '@/rtk/features/userInfoApi';

import { ListWrapper } from './ListWrapper';
import { useFilteredUsers } from './useFilteredUsers';
import classes from './UserList.module.css';

export interface UserListProps {
  userList: User[];
  searchString: string;
  isLoading?: boolean;
}

export const UserList = ({ userList, searchString, isLoading }: UserListProps) => {
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
      />
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={goNextPage}
            disabled={!hasNextPage}
            variant='outline'
            size='md'
            data-color='secondary'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
    </>
  );
};
