import React, { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  DsParagraph,
  DsSearch,
  formatDisplayName,
  List,
  UserListItem,
  type UserListItemProps,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { debounce } from '@/resources/utils';

import classes from './UserListItems.module.css';

export type UserListItemData = UserListItemProps & {
  children?: ReactNode;
  organizationIdentifier?: string;
};

interface UserListItemsProps {
  items: UserListItemData[];
  searchPlaceholder?: string;
  addUserButton?: React.ReactNode;
  emptyText?: string;
}

const PAGE_SIZE = 10;

export const UserListItems = ({
  items,
  searchPlaceholder,
  addUserButton,
  emptyText,
}: UserListItemsProps) => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const placeholder =
    searchPlaceholder ?? t('client_administration_page.client_search_placeholder');

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  const filteredItems = useMemo(() => {
    if (!searchString) {
      return items;
    }
    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchString.trim().toLowerCase()) ||
        item.organizationIdentifier?.toLowerCase().includes(searchString.trim().toLowerCase())
      );
    });
  }, [items, searchString]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchString]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(0, PAGE_SIZE * currentPage);
  }, [filteredItems, currentPage]);

  const hasNextPage = filteredItems.length > PAGE_SIZE * currentPage;
  const goNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const expandedIdsSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prevExpanded) =>
      prevExpanded.includes(id)
        ? prevExpanded.filter((expandedId) => expandedId !== id)
        : [...prevExpanded, id],
    );
  };

  return (
    <div className={classes.container}>
      <div className={classes.search}>
        <DsSearch className={classes.searchBar}>
          <DsSearch.Input
            aria-label={placeholder}
            placeholder={placeholder}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          />
          <DsSearch.Clear
            onClick={() => {
              onSearch.cancel();
              setSearchString('');
            }}
          />
        </DsSearch>
        {addUserButton && <div className={classes.addButton}>{addUserButton}</div>}
      </div>
      {items.length === 0 ? (
        <DsParagraph className={classes.emptyText}>
          {emptyText ?? t('client_administration_page.no_agents')}
        </DsParagraph>
      ) : filteredItems.length === 0 ? (
        <DsParagraph className={classes.emptyText}>
          {t('client_administration_page.no_results')}
        </DsParagraph>
      ) : null}
      <List>
        {paginatedItems.map(({ children, ...item }) => {
          const collapsible = item.collapsible ?? !!children;
          const expanded = expandedIdsSet.has(item.id);
          const handleClick = () => {
            toggleExpanded(item.id);
          };

          return (
            <UserListItem
              key={item.id}
              {...item}
              name={formatDisplayName({
                fullName: item.name,
                type: item.type,
              })}
              collapsible={collapsible}
              expanded={expanded}
              onClick={collapsible ? handleClick : item.onClick}
            >
              <div className={classes.accessRoleItem}>{children}</div>
            </UserListItem>
          );
        })}
      </List>
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={goNextPage}
            variant='outline'
            size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
    </div>
  );
};
