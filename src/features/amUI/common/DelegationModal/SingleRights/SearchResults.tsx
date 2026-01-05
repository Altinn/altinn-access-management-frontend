import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import classes from './ResourceSearch.module.css';

interface SearchResultsProps {
  isFetching: boolean;
  error: any;
  resources?: ServiceResource[];
  searchString?: string;
  delegatedResources?: any[];
  totalNumberOfResults?: number;
  displayPopularResources: boolean;
  currentPage: number;
  searchResultsPerPage: number;
  onSelect: (resource: ServiceResource) => void;
  setCurrentPage: (page: number) => void;
}

export const SearchResults = ({
  isFetching,
  error,
  resources,
  searchString,
  delegatedResources,
  totalNumberOfResults,
  displayPopularResources,
  currentPage,
  searchResultsPerPage,
  onSelect,
  setCurrentPage,
}: SearchResultsProps) => {
  const { t } = useTranslation();

  if (isFetching) {
    return (
      <div className={classes.spinner}>
        <DsSpinner
          aria-label={t('common.loading')}
          data-size='md'
        />
      </div>
    );
  }

  if (error) {
    return (
      <DsAlert
        role='alert'
        className={classes.searchError}
        data-color='danger'
      >
        <DsHeading
          level={2}
          data-size='xs'
        >
          {t('common.general_error_title')}
        </DsHeading>
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <>
      <div className={classes.resultCount}>
        {totalNumberOfResults !== undefined && (
          <DsParagraph>
            {displayPopularResources
              ? t('single_rights.popular_services')
              : `${String(totalNumberOfResults)} ${t('single_rights.search_hits')}`}
          </DsParagraph>
        )}
      </div>
      {resources && resources.length > 0 && (
        <div className={classes.resourceList}>
          <ResourceList
            resources={resources}
            enableSearch={false}
            showMoreButton={false}
            showDetails={false}
            onSelect={onSelect}
            size='sm'
            titleAs='h3'
            getBadge={(resource) => {
              const hasPoa =
                delegatedResources &&
                delegatedResources.some(
                  (delegation) => delegation.resource?.identifier === resource.identifier,
                );

              return hasPoa
                ? { label: t('common.has_poa'), theme: 'base', color: 'success' }
                : undefined;
            }}
          />
        </div>
      )}
      {resources && resources.length === 0 && (
        <DsParagraph data-size='md'>
          {t('resource_list.no_resources_filtered', { searchTerm: searchString })}
        </DsParagraph>
      )}
      {totalNumberOfResults !== undefined &&
        totalNumberOfResults > searchResultsPerPage &&
        !displayPopularResources && (
          <AmPagination
            className={classes.pagination}
            currentPage={currentPage}
            totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
            setCurrentPage={setCurrentPage}
            size='xs'
            hideLabels={true}
          />
        )}
    </>
  );
};
