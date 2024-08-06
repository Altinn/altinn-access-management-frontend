import React, { useState } from 'react';
import { Button, Heading, Tag, Pagination, Search } from '@digdir/designsystemet-react';
import classes from './UsersList.module.css';
import { useTranslation } from 'react-i18next';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { ListItem } from '@/components/List/ListItem';
import { List } from '@/components/List/List';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import { useDebouncedFilteredRightHolders } from './useDebouncedFilteredRightHolders';

export const UsersList = () => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState<string>('');
  const pageSize = 10;

  const { pageEntries, numOfPages, searchResultLength } = useDebouncedFilteredRightHolders(
    searchString,
    currentPage,
    pageSize,
  );

  const onSearch = (newSearchString: string) => {
    setSearchString(newSearchString);
    setCurrentPage(1); // reset current page when searching
  };

  return (
    <div className={classes.usersList}>
      <Search
        className={classes.searchBar}
        placeholder={t('users_page.user_search_placeholder')}
        value={searchString}
        onChange={(event) => onSearch(event.target.value)}
        onClear={() => onSearch('')}
      />
      <List
        compact
        heading={
          <Heading
            level={2}
            size='md'
            spacing
          >
            {t('users_page.user_list_heading')}
          </Heading>
        }
      >
        {pageEntries.map((user) => (
          <UserListItem
            key={user.partyUuid}
            user={user}
          />
        ))}
      </List>
      <Heading
        level={2}
        size='sm'
        role='alert'
        spacing
      >
        {searchResultLength === 0 ? t('users_page.user_no_search_result') : ''}
      </Heading>
      {numOfPages > 1 && (
        <Pagination
          className={classes.pagination}
          size='sm'
          hideLabels={true}
          currentPage={currentPage}
          totalPages={numOfPages}
          onChange={(newPage) => setCurrentPage(newPage)}
          nextLabel='Neste'
          previousLabel='Forrige'
        />
      )}
    </div>
  );
};

const UserListRole = ({ role }: { role: string }) => {
  const { t } = useTranslation();
  return (
    <Tag
      size='sm'
      color='warning'
    >
      {t(`user_role.${role}`)}
    </Tag>
  );
};

const UserListItem = ({ user }: { user: RightHolder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpanable = !!(user.inheritingRightHolders && user.inheritingRightHolders.length > 0);
  const children = (
    <>
      <div>{user.name + (user.unitType ? ` ${user.unitType}` : '')}</div>
      <div className={classes.roleListContainer}>
        {user.registryRoles?.map((role) => {
          return (
            <UserListRole
              key={role}
              role={role}
            />
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <ListItem>
        {isExpanable ? (
          <Button
            onClick={() => setIsExpanded((oldExpanded) => !oldExpanded)}
            variant='tertiary'
            className={classes.listItemContent}
            fullWidth
          >
            <UserIcon
              icon={
                isExpanded ? (
                  <ChevronUpIcon fontSize={'2rem'} />
                ) : (
                  <ChevronDownIcon fontSize={'2rem'} />
                )
              }
            />
            {children}
          </Button>
        ) : (
          <div className={classes.listItemContent}>
            <UserIcon icon={user.name.charAt(0)} />
            {children}
          </div>
        )}
      </ListItem>
      {isExpanded && user.inheritingRightHolders && (
        <List compact>
          {user.inheritingRightHolders.map((user) => (
            <UserListItem
              key={user.name}
              user={user}
            />
          ))}
        </List>
      )}
    </>
  );
};
