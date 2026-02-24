import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import {
  type ResourceDelegation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import classes from './ResourceSearch.module.css';
import { DelegationAction } from '../EditModal';
import { useResourceListDelegation } from './hooks/useResourceListDelegation';
import { useDelegationModalContext } from '../DelegationModalContext';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

interface SearchResultsProps {
  isFetching: boolean;
  error: unknown;
  resources?: ServiceResource[];
  searchString?: string;
  delegatedResources?: ResourceDelegation[];
  totalNumberOfResults?: number;
  displayPopularResources: boolean;
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
  displayPopularResources,
  currentPage,
  searchResultsPerPage,
  onSelect,
  setCurrentPage,
  availableActions,
}: SearchResultsProps) => {
  const { t } = useTranslation();
  const { setActionError } = useDelegationModalContext();
  const isMobile = useIsMobileOrSmaller();

  const { delegateFromList, revokeFromList, isResourceLoading } = useResourceListDelegation({
    onActionError: (resource, errorInfo) => {
      if (errorInfo) {
        onSelect(resource, true);
        setActionError(errorInfo);
        return;
      }
      setActionError(null);
      onSelect(resource);
    },
  });

  const isDelegated = React.useCallback(
    (resourceId: string) =>
      delegatedResources?.some((delegation) => delegation.resource?.identifier === resourceId) ??
      false,
    [delegatedResources],
  );

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
            showDetails={false}
            onSelect={onSelect}
            size='sm'
            titleAs='h3'
            getHasAccess={(resource) => isDelegated(resource.identifier)}
            renderControls={(resource) => {
              const isAlreadyDelegated = isDelegated(resource.identifier);
              const canRevoke = availableActions?.includes(DelegationAction.REVOKE);
              const canDelegate = availableActions?.includes(DelegationAction.DELEGATE);
              const isLoading = isResourceLoading(resource.identifier);
              if (isAlreadyDelegated && canRevoke) {
                return (
                  <DsButton
                    variant='tertiary'
                    data-size='sm'
                    loading={isLoading}
                    onClick={() => {
                      setActionError(null);
                      revokeFromList(resource);
                    }}
                    aria-label={t('common.delete_poa_for', {
                      poa_object: resource.title,
                    })}
                  >
                    <MinusCircleIcon aria-hidden='true' />
                    {!isMobile && t('common.delete_poa')}
                  </DsButton>
                );
              }

              if (!isAlreadyDelegated && canDelegate) {
                return (
                  <DsButton
                    variant='tertiary'
                    data-size='sm'
                    loading={isLoading}
                    onClick={(event) => {
                      setActionError(null);
                      void delegateFromList(resource);
                    }}
                    aria-label={t('common.give_poa_for', {
                      poa_object: resource.title,
                    })}
                  >
                    <PlusCircleIcon aria-hidden='true' />
                    {!isMobile && t('common.give_poa')}
                  </DsButton>
                );
              }

              return null;
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
