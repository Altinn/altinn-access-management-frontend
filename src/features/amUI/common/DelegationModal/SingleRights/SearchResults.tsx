import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph } from '@altinn/altinn-components';

import {
  type ResourceDelegation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { SkeletonResourceList } from '@/features/amUI/common/ResourceList/SkeletonResourceList';
import { SearchHitsStatus } from '@/features/amUI/common/SearchHitsStatus/SearchHitsStatus';

import { type DelegationAction } from '../EditModal';
import { useRestoreFocusOnDataChange } from '../../RestoreFocus';

import classes from './ResourceSearch.module.css';
import { resourceActionControlId } from './createSearchResultControlsRenderer';
import { useSingleRightsListControls } from './hooks/useSingleRightsListControls';

interface SearchResultsProps {
  isFetching: boolean;
  error: unknown;
  resources?: ServiceResource[];
  searchString?: string;
  delegatedResources?: ResourceDelegation[];
  totalNumberOfResults?: number;
  currentPage: number;
  searchResultsPerPage: number;
  onSelect: (resource: ServiceResource, error?: boolean) => void;
  setCurrentPage: (page: number) => void;
  availableActions?: DelegationAction[];
}

export const SearchResults = ({
  isFetching,
  error,
  resources,
  searchString,
  delegatedResources,
  totalNumberOfResults,
  currentPage,
  searchResultsPerPage,
  onSelect,
  setCurrentPage,
  availableActions,
}: SearchResultsProps) => {
  const { t } = useTranslation();
  const requestFocusOnDataChange = useRestoreFocusOnDataChange(delegatedResources);

  // The total is only a hit count once there is a search term. The search resets to page 1 when it
  // changes, so a fetch on page 1 is a new search and clears the total; a fetch for a later page
  // keeps it, so paging does not re-announce it.
  const settledTotal =
    !searchString?.trim() || (isFetching && currentPage === 1) ? undefined : totalNumberOfResults;

  const { renderControls, isDelegated, revokeConfirmationDialog } = useSingleRightsListControls({
    delegatedResources,
    availableActions,
    onSelect,
    onSuccess: (resource) => requestFocusOnDataChange(resourceActionControlId(resource.identifier)),
  });

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
        <SearchHitsStatus
          hits={settledTotal}
          searchString={searchString}
        />
      </div>
      {isFetching ? (
        <div className={classes.resourceList}>
          <SkeletonResourceList count={searchResultsPerPage} />
        </div>
      ) : (
        <>
          {resources && resources.length > 0 && (
            <div className={classes.resourceList}>
              <ResourceList
                resources={resources}
                enableSearch={false}
                onSelect={onSelect}
                size='sm'
                getHasAccess={(resource) => isDelegated(resource.identifier)}
                getActionControlId={(resource) => resourceActionControlId(resource.identifier)}
                renderControls={renderControls}
              />
            </div>
          )}
          {resources && resources.length === 0 && (
            <DsParagraph data-size='md'>
              {t('resource_list.no_resources_filtered', { searchTerm: searchString })}
            </DsParagraph>
          )}
        </>
      )}
      {totalNumberOfResults !== undefined && totalNumberOfResults > searchResultsPerPage && (
        <AmPagination
          className={classes.pagination}
          currentPage={currentPage}
          totalPages={Math.ceil(totalNumberOfResults / searchResultsPerPage)}
          setCurrentPage={setCurrentPage}
          size='xs'
        />
      )}
      {revokeConfirmationDialog}
    </>
  );
};
