/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import * as React from 'react';
import { FilterIcon } from '@navikt/aksel-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  Heading,
  Paragraph,
  Pagination,
  Spinner,
  Alert,
  Search,
  Label,
} from '@digdir/design-system-react';

import { Filter } from '@/components';
import { useMediaQuery } from '@/resources/hooks';
import {
  useGetPaginatedSearchQuery,
  useGetResourceOwnersQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { useAppSelector } from '@/rtk/app/hooks';
import {
  getSingleRightsErrorCodeTextKey,
  prioritizeErrors,
} from '@/resources/utils/errorCodeUtils';
import {
  ServiceStatus,
  type ServiceWithStatus,
} from '@/rtk/features/singleRights/singleRightsSlice';

import { ResourceActionBar } from '../ResourceActionBar';

import classes from './SearchSection.module.css';

export interface SearchSectionParams {
  /** The callback function to be called when a service is selected. */
  onAdd: (resource: ServiceResource) => void;

  /** The callback function to be called when a undoing the selection choice of a service. */
  onUndo: (resourceIdentifier: string) => void;
}

const searchResultsPerPage = 10;

export const SearchSection = ({ onAdd, onUndo }: SearchSectionParams) => {
  const { t } = useTranslation('common');
  const isSm = useMediaQuery('(max-width: 768px)');
  const [filters, setFilters] = useState<string[]>([]);
  const [searchString, setSearchString] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const chosenServices = useAppSelector((state) => state.singleRightsSlice.servicesWithStatus);

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
            size='xlarge'
            variant='interaction'
          />
        </div>
      );
    } else if (error) {
      return (
        <Alert
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
                {String(totalNumberOfResults) + ' ' + t('single_rights.search_hits')}
              </Paragraph>
            )}
            {filterChips()}
          </div>
          <div className={classes.serviceResources}> {serviceResouces}</div>
          {totalNumberOfResults !== undefined && totalNumberOfResults > 0 && (
            <Pagination
              className={classes.pagination}
              currentPage={currentPage}
              totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
              nextLabel={t('common.next')}
              previousLabel={t('common.previous')}
              itemLabel={(num: number) => `Side ${num}`}
              onChange={setCurrentPage}
              size='small'
              compact={isSm}
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
      currentServiceWithStatus?.status === ServiceStatus.HTTPError
        ? currentServiceWithStatus.rightList?.flatMap(
            (result) => result.details?.map((detail) => detail.code) || [],
          ) || []
        : [];

    let prioritizedErrorCodes: string[] = [];

    if (errorCodeTextKeyList?.length > 0) {
      prioritizedErrorCodes = prioritizeErrors(errorCodeTextKeyList);
    }

    return (
      <ResourceActionBar
        key={resource.identifier ?? index}
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
            ? t(`${getSingleRightsErrorCodeTextKey(prioritizedErrorCodes[0])}_title`)
            : undefined
        }
        compact={isSm}
      >
        <div className={classes.serviceResourceContent}>
          {prioritizedErrorCodes?.length > 0 && (
            <Alert
              severity='danger'
              elevated={false}
              className={classes.notDelegableAlert}
            >
              <Heading size='xsmall'>
                {t(`${getSingleRightsErrorCodeTextKey(prioritizedErrorCodes[0])}_title`)}
              </Heading>
              <Paragraph>
                {t(`${getSingleRightsErrorCodeTextKey(prioritizedErrorCodes[0])}`, {
                  you: t('common.you_uppercase'),
                })}
              </Paragraph>
              {prioritizedErrorCodes[0] !== ServiceStatus.HTTPError && (
                <Paragraph>{t('single_rights.ceo_or_main_admin_can_help')}</Paragraph>
              )}
            </Alert>
          )}
          <Paragraph size='small'>{resource.description}</Paragraph>
          <Paragraph size='small'>{resource.rightDescription}</Paragraph>
        </div>
      </ResourceActionBar>
    );
  });

  return (
    <div className={classes.searchSection}>
      <div className={classes.searchInputs}>
        <div className={classes.searchField}>
          <Label>{t('single_rights.search_label')}</Label>
          <Search
            label={t('single_rights.search_label')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchString(event.target.value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchString('');
              setCurrentPage(1);
            }}
          ></Search>
        </div>
        <Filter
          icon={<FilterIcon />}
          label={t('single_rights.filter_label')}
          options={filterOptions}
          applyButtonLabel={t('common.apply')}
          resetButtonLabel={t('common.reset_choices')}
          closeButtonAriaLabel={t('common.close')}
          searchable
          fullScreenModal={isSm}
          values={filters}
          onApply={(filters) => {
            setFilters(filters);
            setCurrentPage(1);
          }}
        ></Filter>
      </div>
      {searchResults()}
    </div>
  );
};
