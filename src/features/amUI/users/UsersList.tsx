import React, { useState, useMemo } from 'react';
import { Button, Heading, Tag, Pagination, Search } from '@digdir/designsystemet-react';
import classes from './UsersList.module.css';
import { useTranslation } from 'react-i18next';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { getArrayPage, getTotalNumOfPages } from '@/resources/utils';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { ListItem } from '@/components/List/ListItem';
import { List } from '@/components/List/List';
import { UserIcon } from '@/components/UserIcon/UserIcon';

const isSearchMatch = (searchString: string, rightHolder: RightHolder): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isPersonIdMatch = rightHolder.personId === searchString;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isPersonIdMatch || isOrgNrMatch;
};

export const UsersList = () => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState<string>('');
  const pageSize = 10;

  const { data: rightHolders } = useGetRightHoldersQuery();

  const [pageEntries, numOfPages] = useMemo(() => {
    if (!rightHolders) {
      return [[], 1];
    }

    const filteredRightHolders: RightHolder[] = [];
    rightHolders.forEach((rightHolder) => {
      if (isSearchMatch(searchString, rightHolder)) {
        filteredRightHolders.push(rightHolder);
      } else if (rightHolder.inheritingRightHolders?.length > 0) {
        // check for searchString matches in inheritingRightHolders
        const matchingInheritingItems = rightHolder.inheritingRightHolders.filter(
          (inheritRightHolder) => isSearchMatch(searchString, inheritRightHolder),
        );
        if (matchingInheritingItems.length > 0) {
          filteredRightHolders.push({
            ...rightHolder,
            inheritingRightHolders: matchingInheritingItems,
          });
        }
      }
    });

    const numPages = getTotalNumOfPages(filteredRightHolders, pageSize);
    return [getArrayPage(filteredRightHolders, currentPage, pageSize), numPages];
  }, [rightHolders, currentPage, searchString]);

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
            size='lg'
            spacing
          >
            {t('users_page.user_list_heading')}
          </Heading>
        }
      >
        {pageEntries.length === 0 && searchString && (
          <div>{t('users_page.user_no_search_result')}</div>
        )}
        {pageEntries.map((user) => (
          <UserListItem
            key={user.partyUuid}
            user={user}
          />
        ))}
      </List>
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
    </div>
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
            <Tag
              key={role}
              size='sm'
              color='warning'
            >
              {role}
            </Tag>
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
