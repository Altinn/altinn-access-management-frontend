/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { FilterIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsSpinner,
  DsAlert,
  DsHeading,
  DsParagraph,
  DsSearch,
  DsChip,
} from '@altinn/altinn-components';

import { ResourceActionBar } from '../ResourceActionBar';

import classes from './SearchSection.module.css';

import { Filter } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { useAppSelector } from '@/rtk/app/hooks';
import { ErrorCode, getErrorCodeTextKey, prioritizeErrors } from '@/resources/utils/errorCodeUtils';
import {
  ServiceStatus,
  type ServiceWithStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';
import { arraysEqual, debounce } from '@/resources/utils';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';
import { AmPagination } from '@/components/Paginering';

export interface SearchSectionParams {
  /** The callback function to be called when a service is selected. */
  onAdd: (resource: ServiceResource) => void;

  /** The callback function to be called when a undoing the selection choice of a service. */
  onUndo: (resourceIdentifier: string) => void;
}

const searchResultsPerPage = 10;

export const SearchSection = ({ onAdd, onUndo }: SearchSectionParams) => {
  const { t } = useTranslation();
  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const chosenServices = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);
  const { data: reporteeData } = useGetReporteeQuery();

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
        <DsChip.Removable
          data-size='sm'
          key={filterValue}
          aria-label={t('common.remove') + ' ' + String(getFilterLabel(filterValue))}
          onClick={() => {
            unCheckFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </DsChip.Removable>
      ))}
    </div>
  );

  const searchResults = () => {
    if (isFetching) {
      return (
        <div className={classes.spinner}>
          <DsSpinner
            aria-label={t('common.loading')}
            data-size='xl'
          />
        </div>
      );
    } else if (error) {
      return (
        <DsAlert
          role='alert'
          className={classes.searchError}
          data-color='danger'
        >
          <DsHeading
            level={2}
            data-size='xs'
            className={classes.searchErrorHeading}
          >
            {t('common.general_error_title')}
          </DsHeading>
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
        </DsAlert>
      );
    } else {
      const totalPages =
        totalNumberOfResults && Math.ceil(totalNumberOfResults / searchResultsPerPage);
      return (
        <>
          <div className={classes.resultCountAndChips}>
            {totalNumberOfResults !== undefined && (
              <DsParagraph>
                {displayPopularResources
                  ? t('single_rights.popular_services')
                  : String(totalNumberOfResults) + ' ' + t('single_rights.search_hits')}
              </DsParagraph>
            )}
            {filterChips()}
          </div>
          <ul className={classes.serviceResources}> {serviceResouces}</ul>
          {totalNumberOfResults !== undefined &&
            totalNumberOfResults > 0 &&
            !displayPopularResources &&
            totalPages &&
            totalPages > 1 && (
              <AmPagination
                className={classes.pagination}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                size='sm'
                hideLabels={isSm}
              />
            )}
        </>
      );
    }
  };

  const serviceResouces = resources?.map((resource: ServiceResource, index: number) => {
    const currentServiceWithStatus = chosenServices.find(
      (selected: ServiceWithStatus) => selected.service?.identifier === resource.identifier,
    );

    const isLoading = currentServiceWithStatus?.isLoading;
    const status = currentServiceWithStatus?.status;

    const errorCodeTextKeyList =
      currentServiceWithStatus?.status === ServiceStatus.NotDelegable ||
      currentServiceWithStatus?.status === ServiceStatus.Unauthorized ||
      currentServiceWithStatus?.status === ServiceStatus.HTTPError
        ? currentServiceWithStatus.rightList?.flatMap(
            (result) =>
              result.details
                ?.filter((detail) => Object.values(ErrorCode).includes(detail.code as ErrorCode))
                .map((detail) => detail.code) || [],
          ) || []
        : [];

    let prioritizedErrorCodes: string[] = [];

    if (errorCodeTextKeyList?.length > 0) {
      prioritizedErrorCodes = prioritizeErrors(errorCodeTextKeyList.filter(Boolean) as string[]);
    }

    return (
      <li key={resource.identifier ?? index}>
        <ResourceActionBar
          title={resource.title}
          subtitle={resource.resourceOwnerName}
          status={status ?? ServiceStatus.Unchecked}
          isLoading={isLoading}
          onAddClick={() => {
            onAdd(resource);
          }}
          onRemoveClick={() => {
            onUndo(resource.identifier);
          }}
          errorText={
            prioritizedErrorCodes?.length > 0
              ? t(`${getErrorCodeTextKey(prioritizedErrorCodes[0])}_label`)
              : undefined
          }
          compact={isSm}
        >
          <div className={classes.serviceResourceContent}>
            {prioritizedErrorCodes?.length > 0 && (
              <DsAlert
                role='alert'
                data-color='danger'
                className={classes.notDelegableAlert}
              >
                <DsHeading data-size='xs'>
                  {t('single_rights.cannot_delegate_alert_heading')}
                </DsHeading>
                <DsParagraph>
                  {t(`${getErrorCodeTextKey(prioritizedErrorCodes[0])}`, {
                    you: t('common.you_uppercase'),
                    serviceowner: resource.resourceOwnerName,
                    reporteeorg: reporteeData?.name,
                  })}
                </DsParagraph>
              </DsAlert>
            )}
            <DsParagraph data-size='sm'>{resource.description}</DsParagraph>
            <DsParagraph data-size='sm'>{resource.rightDescription}</DsParagraph>
          </div>
        </ResourceActionBar>
      </li>
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
          <DsSearch data-size='md'>
            <DsSearch.Input
              aria-label={String(t('single_rights.search_label'))}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                debouncedSearch(event.target.value);
              }}
            />
            <DsSearch.Clear
              onClick={() => {
                setSearchString('');
                setCurrentPage(1);
              }}
            />
          </DsSearch>
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
          fullScreenModal={isSm}
          values={filters}
          onApply={(filtersToApply) => {
            if (!arraysEqual(filtersToApply, filters)) {
              setFilters(filtersToApply);
              setCurrentPage(1);
            }
          }}
        />
      </div>
      {searchResults()}
    </search>
  );
};
