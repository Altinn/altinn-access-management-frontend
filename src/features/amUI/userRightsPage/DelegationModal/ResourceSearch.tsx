import * as React from 'react';
import {
  Alert,
  Chip,
  Heading,
  Pagination,
  Paragraph,
  Search,
  Spinner,
} from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { FilterIcon, ChevronRightIcon, FileIcon } from '@navikt/aksel-icons';
import { useRef } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetPaginatedSearchQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import { Filter, List, ListItem } from '@/components';
import { Avatar } from '@/components/Avatar/Avatar';

import classes from './ResourceSearch.module.css';
import { useDelegationModalContext } from './DelegationModalContext';

export interface ResourceSearchProps {
  onSelection: (resource: ServiceResource) => void;
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelection }: ResourceSearchProps) => {
  const { t } = useTranslation();

  const { searchString, setSearchString, filters, setFilters, currentPage, setCurrentPage } =
    useDelegationModalContext();

  const {
    data: searchData,
    error,
    isFetching,
  } = useGetPaginatedSearchQuery({
    searchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });

  const displayPopularResources =
    !searchString && filters.length === 0 && window.featureFlags.displayPopularSingleRightsServices;

  const resources = searchData?.pageList;
  const totalNumberOfResults = searchData?.numEntriesTotal;
  const { data: ROdata } = useGetResourceOwnersQuery();

  const searchInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = searchString;
    }
  }, []);

  const filterOptions = ROdata
    ? ROdata.map((ro) => {
        return {
          label: ro.organisationName,
          value: ro.organisationNumber,
        };
      })
    : [];

  const unCheckFilter = (filter: string) => {
    setFilters((prevState: string[]) => prevState.filter((f) => f !== filter));
    setCurrentPage(1);
  };

  const getFilterLabel = (value: string) => {
    const option = filterOptions.find((option) => option.value === value);
    return option ? option.label : '';
  };

  const filterChips = () => (
    <Chip.Group
      size='small'
      className={classes.filterChips}
    >
      {filters.map((filterValue: string) => (
        <Chip.Removable
          key={filterValue}
          aria-label={t('common.remove') + ' ' + String(getFilterLabel(filterValue))}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </Chip.Removable>
      ))}
    </Chip.Group>
  );

  const searchResults = () => {
    if (isFetching) {
      return (
        <div className={classes.spinner}>
          <Spinner
            title={t('common.loading')}
            size='md'
            variant='interaction'
          />
        </div>
      );
    } else if (error) {
      return (
        <Alert
          role='alert'
          className={classes.searchError}
          severity='danger'
          iconTitle={t('common.error')}
        >
          <Heading
            level={2}
            size='xsmall'
            spacing
          >
            {t('common.general_error_title')}
          </Heading>
          <Paragraph>{t('common.general_error_paragraph')}</Paragraph>
        </Alert>
      );
    } else {
      return (
        <>
          <div className={classes.resultCountAndChips}>
            {totalNumberOfResults !== undefined && (
              <Paragraph>
                {displayPopularResources
                  ? t('single_rights.popular_services')
                  : String(totalNumberOfResults) + ' ' + t('single_rights.search_hits')}
              </Paragraph>
            )}
            {filterChips()}
          </div>
          <List className={classes.resourceList}> {listedResources}</List>
          {totalNumberOfResults !== undefined &&
            totalNumberOfResults > searchResultsPerPage &&
            !displayPopularResources && (
              <Pagination
                className={classes.pagination}
                currentPage={currentPage}
                totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
                nextLabel={t('common.next')}
                previousLabel={t('common.previous')}
                itemLabel={(num: number) => `Side ${num}`}
                onChange={setCurrentPage}
                size='sm'
                compact={true}
                hideLabels={true}
              />
            )}
        </>
      );
    }
  };

  const listedResources = resources?.map((resource: ServiceResource, index: number) => {
    return (
      <ListItem
        key={resource.identifier ?? index}
        className={classes.resourceItem}
        onClick={() => onSelection(resource)}
      >
        <span className={classes.resource}>
          <Avatar
            size='md'
            profile='serviceOwner'
            icon={<FileIcon />}
          />
          <span className={classes.resourceHeading}>
            <Paragraph>{resource.title}</Paragraph>
            <Paragraph
              size='xs'
              className={classes.resourceSubtitle}
            >
              {resource.resourceOwnerName}
            </Paragraph>
          </span>
        </span>
        <ChevronRightIcon fontSize='1.5em' />
      </ListItem>
    );
  });

  const debouncedSearch = debounce((searchString: string) => {
    setSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  return (
    <search className={classes.searchSection}>
      <div className={classes.searchInputs}>
        <div className={classes.searchField}>
          <Search
            label={t('single_rights.search_label')}
            hideLabel={false}
            ref={searchInputRef}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              debouncedSearch(event.target.value);
            }}
            size='sm'
            onClear={() => {
              setSearchString('');
              setCurrentPage(1);
            }}
          />
        </div>
        <Filter
          className={classes.filter}
          icon={<FilterIcon />}
          label={t('single_rights.filter_label')}
          options={filterOptions}
          applyButtonLabel={t('common.apply')}
          resetButtonLabel={t('common.reset_choices')}
          closeButtonAriaLabel={t('common.close')}
          searchable
          values={filters}
          onApply={(filtersToApply: string[]) => {
            if (!arraysEqual(filtersToApply, filters)) {
              setFilters(filtersToApply);
              setCurrentPage(1);
            }
          }}
        />
      </div>
      <div className={classes.searchResults}>{searchResults()}</div>
    </search>
  );
};
