import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsHeading, DsParagraph, DsSpinner, useSnackbar } from '@altinn/altinn-components';

import {
  type ResourceDelegation,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { getInheritedStatus } from '@/features/amUI/common/useInheritedStatus';

import classes from './ResourceSearch.module.css';
import { DelegationAction } from '../EditModal';
import { useResourceListDelegation } from './hooks/useResourceListDelegation';
import { useDelegationModalContext } from '../DelegationModalContext';
import { useRenderSearchResultControl } from './createSearchResultControlsRenderer';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import {
  useCreateSingleRightRequestMutation,
  useDeleteSingleRightRequestMutation,
  useGetSingleRightRequestsQuery,
} from '@/rtk/features/requestApi';

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
  const { actingParty, toParty, fromParty } = usePartyRepresentation();
  const { openSnackbar } = useSnackbar();

  const { delegateFromList, revokeFromList, isResourceLoading } = useResourceListDelegation({
    onActionError: (resource, errorInfo) => {
      onSelect(resource, true);
      setActionError(errorInfo);
    },
    onSuccess: (resource) => {
      setActionError(null);
    },
    onPartialDelegation: (resource) => {
      setActionError(null);
      onSelect(resource);
    },
  });
  const { data: singleRightRequests } = useGetSingleRightRequestsQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      to: fromParty?.partyUuid || '',
    },
    {
      skip: !availableActions?.includes(DelegationAction.REQUEST),
    },
  );

  const [createRequest, { isLoading: isCreatingRequest }] = useCreateSingleRightRequestMutation();
  const [deleteSentRequest, { isLoading: isDeletingRequest }] =
    useDeleteSingleRightRequestMutation();
  const requestFromList = (resource: ServiceResource) => {
    createRequest({
      actingParty: actingParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
      resource: resource.identifier,
    })
      .unwrap()
      .then(() => {
        openSnackbar({
          message: t('delegation_modal.request.sent_request_success', { resource: resource.title }),
          color: 'success',
        });
      })
      .catch(() => {
        openSnackbar({
          message: t('delegation_modal.request.sent_request_error', { resource: resource.title }),
          color: 'danger',
        });
        //onSelect(resource, true);
      });
  };

  const deleteRequestFromList = (resource: ServiceResource) => {
    const requestId = (singleRightRequests ?? []).find(
      (x) => x.resourceId === resource.identifier,
    )?.id;
    if (requestId) {
      deleteSentRequest({
        actingParty: actingParty?.partyUuid || '',
        requestId: requestId,
      })
        .unwrap()
        .then(() => {
          openSnackbar({
            message: t('delegation_modal.request.withdraw_request_success', {
              resource: resource.title,
            }),
            color: 'success',
          });
        })
        .catch(() => {
          openSnackbar({
            message: t('delegation_modal.request.withdraw_request_error', {
              resource: resource.title,
            }),
            color: 'danger',
          });
          //onSelect(resource, true);
        });
    }
  };

  const isDelegated = (resourceId: string) =>
    delegatedResources?.some((delegation) => delegation.resource?.identifier === resourceId) ??
    false;

  const isInherited = (resourceId: string) => {
    const delegation = delegatedResources?.find((item) => item.resource?.identifier === resourceId);
    if (!delegation) {
      return false;
    }
    return (
      getInheritedStatus({
        permissions: delegation.permissions,
        toParty,
      }).length > 0
    );
  };

  const isRequested = (resourceId: string) => {
    return (singleRightRequests ?? []).some((x) => x.resourceId === resourceId);
  };

  const isLoading = (resourceId: string) => {
    return isResourceLoading(resourceId) || isCreatingRequest || isDeletingRequest;
  };

  const renderControls = useRenderSearchResultControl({
    isDelegated,
    isInherited,
    isRequested,
    availableActions,
    isResourceLoading: isLoading,
    setActionError,
    revokeFromList,
    delegateFromList,
    requestFromList,
    deleteRequestFromList,
  });

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
            renderControls={renderControls}
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
