import React, { useState } from 'react';
import { Heading, Search, Paragraph } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import type { AvatarType, ListItemSize } from '@altinn/altinn-components';
import { ListItem } from '@altinn/altinn-components';
import { Link } from 'react-router-dom';

import { type RightHolder } from '@/rtk/features/userInfoApi';
import { debounce } from '@/resources/utils';
import { AmPagination } from '@/components/Paginering';
import { List } from '@/components';

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
        className={classes.usersListItems}
      >
        {pageEntries.map((entry) => (
          <RightholderListItem
            rightholder={entry}
            key={entry.partyUuid}
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

const RightholderListItem = ({ rightholder }: { rightholder: RightHolder }) => {
  const [expanded, setExpanded] = useState(false);
  const collapsible =
    rightholder.inheritingRightHolders && rightholder.inheritingRightHolders.length > 0;

  const avatar = {
    type:
      rightholder.partyType.toString() === 'Organization'
        ? ('company' as AvatarType)
        : ('person' as AvatarType),
    name: rightholder.name,
  };
  const baseListItemProps = {
    id: rightholder.partyUuid,
    title: rightholder.name,
    description: rightholder.unitType,
    size: 'lg' as ListItemSize,
    linkIcon: 'chevron-right' as const,
    avatar,
  };

  return (
    <li>
      {collapsible ? (
        <ListItem
          {...baseListItemProps}
          collapsible
          as='button'
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        />
      ) : (
        <ListItem
          {...baseListItemProps}
          as={(props) => (
            <Link
              {...props}
              to={`${rightholder.partyUuid}`}
            />
          )}
        />
      )}

      {expanded && collapsible && (
        <InheritingRightHoldersList inheritingRightHolders={rightholder.inheritingRightHolders} />
      )}
    </li>
  );
};

const InheritingRightHoldersList = ({
  inheritingRightHolders,
}: {
  inheritingRightHolders: RightHolder[];
}) => {
  const items =
    inheritingRightHolders?.map((inheritingRightHolder) => ({
      id: inheritingRightHolder.partyUuid,
      title: inheritingRightHolder.name,
      description: inheritingRightHolder.unitType,
      as: Link,
      to: `${inheritingRightHolder.partyUuid}`,
      linkIcon: 'chevron-right' as const,
      avatar: {
        type:
          inheritingRightHolder.partyType.toString() === 'Organization'
            ? ('company' as AvatarType)
            : ('person' as AvatarType),
        name: inheritingRightHolder.name,
      },
    })) || [];

  return (
    <div className={classes.inheritingRightHoldersList}>
      <ul className={classes.usersListItems}>
        {items.map((item) => (
          <li key={item.id}>
            <ListItem
              size='sm'
              {...item}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
