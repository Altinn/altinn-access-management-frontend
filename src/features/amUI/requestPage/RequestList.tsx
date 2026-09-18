import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DsParagraph, List } from '@altinn/altinn-components';

import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';

import type { HandledDirection } from './HandledRequestModal/useHandledRequests';
import { HandledRequestsSection } from './HandledRequestsSection';
import { useFilteredRequests } from './useFilteredRequests';
import type { Request } from './types';
import classes from './RequestPage.module.css';

const PAGE_SIZE = 8;

interface RequestListProps {
  pendingRequests: Request[] | undefined;
  handledRequests: Request[] | undefined;
  direction: HandledDirection;
  renderItem: (request: Request) => React.ReactNode;
}

export const RequestList = ({
  pendingRequests,
  handledRequests,
  direction,
  renderItem,
}: RequestListProps) => {
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const filteredRequests = useFilteredRequests(pendingRequests, searchString);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchString]);

  const hasSearchableRequests = (pendingRequests?.length ?? 0) + (handledRequests?.length ?? 0) > 0;
  const paginatedRequests = filteredRequests.slice(0, PAGE_SIZE * currentPage);
  const hasNextPage = filteredRequests.length > PAGE_SIZE * currentPage;

  return (
    <>
      {hasSearchableRequests && (
        <div className={classes.searchField}>
          <DebouncedSearchField
            placeholder={t('request_page.search_placeholder')}
            setDebouncedSearchString={setSearchString}
          />
        </div>
      )}
      {searchString && filteredRequests.length === 0 && (
        <DsParagraph className={classes.noResults}>
          {t('request_page.no_search_results', { searchTerm: searchString })}
        </DsParagraph>
      )}
      <List>{paginatedRequests.map(renderItem)}</List>
      {hasNextPage && (
        <div className={classes.showMoreButtonContainer}>
          <Button
            className={classes.showMoreButton}
            onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
            variant='outline'
            size='md'
          >
            {t('common.show_more')}
          </Button>
        </div>
      )}
      <HandledRequestsSection
        handledRequests={handledRequests}
        direction={direction}
        searchString={searchString}
      />
    </>
  );
};
