import React, { useState } from 'react';
import { Heading, Search, Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import { type RightHolder } from '@/rtk/features/userInfoApi';
import { ListItem } from '@/features/amUI/common/List/ListItem';
import { List } from '@/features/amUI/common/List/List';
import { debounce } from '@/resources/utils';
import { AmPagination } from '@/components/Paginering';

import { useFilteredRightHolders } from './useFilteredRightHolders';
import classes from './UsersList.module.css';
import { UserItem } from './UserItem';

export const UsersList = () => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState<string>('');

  const pageSize = 10;

  const { pageEntries, numOfPages, searchResultLength, currentUserAsRightHolder } =
    useFilteredRightHolders(searchString, currentPage, pageSize);

  const onSearch = debounce((newSearchString: string) => {
    setSearchString(newSearchString);
    setCurrentPage(1); // reset current page when searching
  }, 300);

  return (
    <div className={classes.usersList}>
      {currentUserAsRightHolder && (
        <UserItem
          user={currentUserAsRightHolder}
          size='lg'
          className={classes.currentUser}
        />
      )}
      <Heading
        level={2}
        size='sm'
        id='user_list_heading_id'
        className={classes.usersListHeading}
      >
        {t('users_page.user_list_heading')}
      </Heading>
      <Search
        className={classes.searchBar}
        placeholder={t('users_page.user_search_placeholder')}
        onChange={(event) => onSearch(event.target.value)}
        onClear={() => {
          setSearchString('');
          setCurrentPage(1);
        }}
        hideLabel
        label={t('users_page.user_search_placeholder')}
      />
      <List
        spacing
        aria-labelledby='user_list_heading_id'
      >
        {pageEntries.map((user) => (
          <UserListItem
            key={user.partyUuid}
            user={user}
          />
        ))}
      </List>
      <Paragraph
        role='alert'
        size='lg'
      >
        {searchResultLength === 0 ? t('users_page.user_no_search_result') : ''}
      </Paragraph>
      {numOfPages > 1 && (
        <AmPagination
          className={classes.pagination}
          size='sm'
          hideLabels={true}
          currentPage={currentPage}
          totalPages={numOfPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

const UserListItem = ({ user }: { user: RightHolder }) => {
  const hasChildren = !!(user.inheritingRightHolders && user.inheritingRightHolders.length > 0);

  return (
    <>
      <ListItem>
        <UserItem user={user}>
          {hasChildren && (
            <List>
              {user.inheritingRightHolders.map((user) => (
                <ListItem key={user.partyUuid}>
                  <UserItem
                    user={user}
                    size='sm'
                    className={classes.inheritingUsers}
                    icon={false}
                    showRoles={false}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </UserItem>
      </ListItem>
    </>
  );
};
