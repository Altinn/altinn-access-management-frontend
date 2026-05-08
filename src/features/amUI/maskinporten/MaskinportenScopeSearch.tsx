import * as React from 'react';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  SnackbarDuration,
  formatDisplayName,
  useSnackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';

import { AmPagination } from '@/components/Paginering/AmPaginering';
import { ResourceFilterToolbar } from '@/features/amUI/common/ResourceFilterToolbar/ResourceFilterToolbar';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { debounce } from '@/resources/utils';
import type { ActionError } from '@/resources/hooks/useActionError';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import {
  useAddMaskinportenResourceMutation,
  useGetMaskinportenResourcesQuery,
  useRemoveMaskinportenResourceMutation,
  useSearchMaskinportenScopesQuery,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import classes from '../common/DelegationModal/SingleRights/ResourceSearch.module.css';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

const searchResultsPerPage = 7;

const getScopeCount = (resource: ServiceResource) =>
  resource.resourceReferences?.filter(
    (reference) => reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
  ).length ?? 0;

const extractStatus = (error: unknown): string => {
  if (error && typeof error === 'object' && 'status' in error) {
    return String((error as { status: unknown }).status);
  }
  return String(error);
};

const extractDetails = (error: unknown): ActionError['details'] | undefined => {
  if (error && typeof error === 'object' && 'data' in error) {
    return error.data as ActionError['details'];
  }
  return undefined;
};

const getErrorInfo = (error: unknown): ActionError => ({
  httpStatus: extractStatus(error),
  details: extractDetails(error),
  timestamp: new Date().toISOString(),
});

export const MaskinportenScopeSearch = ({
  onSelect,
}: {
  onSelect: (resource: ServiceResource, error?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const isMobile = useIsMobileOrSmaller();
  const { fromParty, toParty } = usePartyRepresentation();
  const {
    searchString,
    setSearchString,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    setActionError,
  } = useDelegationModalContext();
  const [debouncedSearchString, setDebouncedSearchString] = React.useState(searchString);
  const [loadingByResourceId, setLoadingByResourceId] = React.useState<Record<string, boolean>>({});
  const [addResource] = useAddMaskinportenResourceMutation();
  const [removeResource] = useRemoveMaskinportenResourceMutation();

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchString(value);
        setCurrentPage(1);
      }, 300),
    [],
  );

  React.useEffect(() => {
    return () => debouncedSearch.cancel?.();
  }, [debouncedSearch]);

  React.useEffect(() => {
    if (!searchString) {
      debouncedSearch.cancel?.();
      setDebouncedSearchString('');
      setCurrentPage(1);
    }
  }, [debouncedSearch, searchString]);

  const { data, error, isFetching } = useSearchMaskinportenScopesQuery({
    searchString: debouncedSearchString,
    ROfilters: filters,
    page: currentPage,
    resultsPerPage: searchResultsPerPage,
  });
  const { data: resourceOwners } = useGetResourceOwnersQuery([ResourceType.MaskinportenSchema]);
  const supplier = toParty?.orgNumber ?? '';
  const {
    data: delegatedResources,
    isFetching: isDelegatedResourcesFetching,
    refetch: refetchDelegatedResources,
  } = useGetMaskinportenResourcesQuery(
    {
      party: fromParty?.partyUuid,
      supplier,
    },
    {
      skip: !fromParty?.partyUuid || !supplier,
      refetchOnMountOrArgChange: true,
    },
  );

  const resources = data?.pageList ?? [];
  const totalNumberOfResults = data?.numEntriesTotal;
  const filterOptions =
    resourceOwners?.map((owner) => ({
      label: owner.organisationName ?? owner.organisationCode,
      value: owner.organisationCode,
    })) ?? [];
  const toPartyName = formatDisplayName({
    fullName: toParty?.name ?? '',
    type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
  });
  const isDelegated = (resourceId: string) =>
    delegatedResources?.some(
      (delegatedResource) => delegatedResource.resource?.identifier === resourceId,
    ) ?? false;

  const setResourceLoading = (resourceId: string, isLoading: boolean) => {
    setLoadingByResourceId((prev) => ({ ...prev, [resourceId]: isLoading }));
  };

  const handleAddResource = async (resource: ServiceResource) => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier) {
      return;
    }

    setResourceLoading(resource.identifier, true);
    try {
      await addResource({
        party: fromParty.partyUuid,
        supplier,
        resource: resource.identifier,
      }).unwrap();
      await refetchDelegatedResources();
      setActionError(null);
      openSnackbar({
        message: t('single_rights.add_singleRight_success_message', {
          name: toPartyName,
          resourceTitle: resource.title,
        }),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch (error) {
      setActionError(getErrorInfo(error));
      onSelect(resource, true);
    } finally {
      setResourceLoading(resource.identifier, false);
    }
  };

  const handleRemoveResource = async (resource: ServiceResource) => {
    if (!fromParty?.partyUuid || !supplier || !resource.identifier) {
      return;
    }

    setResourceLoading(resource.identifier, true);
    try {
      await removeResource({
        party: fromParty.partyUuid,
        supplier,
        resource: resource.identifier,
      }).unwrap();
      await refetchDelegatedResources();
      setActionError(null);
      openSnackbar({
        message: t('single_rights.delete_singleRight_success_message', {
          name: toPartyName,
          resourceTitle: resource.title,
        }),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch (error) {
      setActionError(getErrorInfo(error));
      onSelect(resource, true);
    } finally {
      setResourceLoading(resource.identifier, false);
    }
  };

  const renderControls = (resource: ServiceResource) => {
    const hasDelegatedResource = isDelegated(resource.identifier);
    const isLoading = loadingByResourceId[resource.identifier] ?? false;

    if (hasDelegatedResource) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={isLoading}
          disabled={isLoading || isDelegatedResourcesFetching}
          onClick={(event) => {
            event.stopPropagation();
            setActionError(null);
            handleRemoveResource(resource);
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

    return (
      <DsButton
        variant='tertiary'
        data-size='sm'
        loading={isLoading}
        disabled={isLoading || isDelegatedResourcesFetching || resource.delegable === false}
        onClick={(event) => {
          event.stopPropagation();
          setActionError(null);
          handleAddResource(resource);
        }}
        aria-label={t('common.give_poa_for', {
          poa_object: resource.title,
        })}
      >
        <PlusCircleIcon aria-hidden='true' />
        {!isMobile && t('common.give_poa')}
      </DsButton>
    );
  };

  const setSearch = (value: string) => {
    setSearchString(value);
    if (!value) {
      debouncedSearch.cancel?.();
      setDebouncedSearchString('');
      setCurrentPage(1);
      return;
    }
    debouncedSearch(value);
  };

  return (
    <>
      <DsHeading
        level={2}
        data-size='sm'
      >
        {t('maskinporten_page.search_scopes_heading', { name: toPartyName })}
      </DsHeading>
      <div className={classes.toolbarContainer}>
        <ResourceFilterToolbar
          search={searchString}
          setSearch={setSearch}
          filterState={filters}
          setFilterState={(nextFilters) => {
            setFilters(nextFilters);
            setCurrentPage(1);
          }}
          serviceOwnerOptions={filterOptions}
        />
      </div>
      <div className={classes.searchResults}>
        {isFetching ? (
          <div className={classes.spinner}>
            <DsSpinner
              aria-label={t('common.loading')}
              data-size='md'
            />
          </div>
        ) : error ? (
          <DsAlert
            role='alert'
            data-color='danger'
          >
            <DsHeading
              level={3}
              data-size='xs'
            >
              {t('common.general_error_title')}
            </DsHeading>
            <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          </DsAlert>
        ) : (
          <>
            {totalNumberOfResults !== undefined && (
              <DsParagraph>
                {String(totalNumberOfResults)} {t('single_rights.search_hits')}
              </DsParagraph>
            )}
            {resources.length > 0 ? (
              <ResourceList
                resources={resources}
                enableSearch={false}
                showDetails={false}
                onSelect={onSelect}
                size='sm'
                titleAs='h3'
                getHasAccess={(resource) => isDelegated(resource.identifier)}
                renderControls={renderControls}
                getDescriptionText={(resource) =>
                  t('maskinporten_page.scope_count', { count: getScopeCount(resource) })
                }
              />
            ) : (
              <DsParagraph data-size='md'>
                {searchString
                  ? t('resource_list.no_resources_filtered', { searchTerm: searchString })
                  : t('maskinporten_page.no_scopes')}
              </DsParagraph>
            )}
            {totalNumberOfResults !== undefined && totalNumberOfResults > searchResultsPerPage && (
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
        )}
      </div>
    </>
  );
};
