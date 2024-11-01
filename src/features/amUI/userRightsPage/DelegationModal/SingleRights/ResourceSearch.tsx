import * as React from 'react';
import { Alert, Chip, Heading, Paragraph, Search, Spinner } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { FilterIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { useParams } from 'react-router-dom';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import {
  useGetPaginatedSearchQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';
import { Filter, List, ListItem } from '@/components';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { AmPagination } from '@/components/Paginering/AmPaginering';

import classes from './ResourceSearch.module.css';
import { useDelegationModalContext } from './../DelegationModalContext';

export interface ResourceSearchProps {
  onSelection: (resource: ServiceResource) => void;
}

const searchResultsPerPage = 7;

export const ResourceSearch = ({ onSelection }: ResourceSearchProps) => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { searchString, setSearchString, filters, setFilters, currentPage, setCurrentPage } =
    useDelegationModalContext();
  const [debouncedSearchString, setDebouncedSearchString] = React.useState(searchString);
  const {
    data: searchData,
    error,
    isFetching,
  } = useGetPaginatedSearchQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });
  const { data: delegatedResources } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  const displayPopularResources =
    !searchString && filters.length === 0 && window.featureFlags.displayPopularSingleRightsServices;

  const resources = searchData?.pageList;
  const totalNumberOfResults = searchData?.numEntriesTotal;
  const { data: ROdata } = useGetResourceOwnersQuery();

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
    <div className={classes.filterChips}>
      {filters.map((filterValue: string) => (
        <Chip.Removable
          size='sm'
          key={filterValue}
          aria-label={t('common.remove') + ' ' + String(getFilterLabel(filterValue))}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </Chip.Removable>
      ))}
    </div>
  );

  const searchResults = () => {
    if (isFetching) {
      return (
        <div className={classes.spinner}>
          <Spinner
            title={t('common.loading')}
            size='md'
          />
        </div>
      );
    } else if (error) {
      return (
        <Alert
          role='alert'
          className={classes.searchError}
          color='danger'
        >
          <Heading
            level={2}
            size='xs'
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
              <AmPagination
                className={classes.pagination}
                currentPage={currentPage}
                totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
                setCurrentPage={setCurrentPage}
                size='sm'
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
            logoUrl={resource.resourceOwnerLogoUrl}
            name={resource.resourceOwnerName}
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
        <div className={classes.listItemRight}>
          {!!delegatedResources &&
            delegatedResources.some(
              (delegation) => delegation.resource?.identifier === resource.identifier,
            ) && (
              <Paragraph
                size='xs'
                className={classes.infoText}
              >
                {t('common.has_poa')}
              </Paragraph>
            )}
          <ChevronRightIcon fontSize='1.5em' />
        </div>
      </ListItem>
    );
  });

  const debouncedSearch = debounce((searchString: string) => {
    setDebouncedSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  return (
    <search className={classes.searchSection}>
      <div className={classes.searchInputs}>
        <div className={classes.searchField}>
          <Search
            label={t('single_rights.search_label')}
            hideLabel={true}
            value={searchString}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchString(event.target.value);
              debouncedSearch(event.target.value);
            }}
            size='sm'
            onClear={() => {
              setSearchString('');
              setDebouncedSearchString('');
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
