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
import { debounce } from '@/resources/utils';
import { ResourceType, useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import {
  useGetMaskinportenResourcesQuery,
  useSearchMaskinportenScopesQuery,
} from '@/rtk/features/maskinportenApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { ScopeList } from './ScopeList';
import { useMaskinportenResourceActions } from './hooks/useMaskinportenResourceActions';

import classes from './MaskinportenPage.module.css';

const searchResultsPerPage = 7;

export const ScopeSearch = ({
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
  const supplier = toParty?.orgNumber ?? '';
  const { delegate, remove, isLoading } = useMaskinportenResourceActions({
    party: fromParty?.partyUuid,
    supplier,
  });

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
  const { data: delegatedResources, isFetching: isDelegatedResourcesFetching } =
    useGetMaskinportenResourcesQuery(
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

  const onActionSuccess = (resource: ServiceResource, mode: 'delegate' | 'revoke') => {
    setActionError(null);
    openSnackbar({
      message: t(
        mode === 'delegate'
          ? 'single_rights.add_singleRight_success_message'
          : 'single_rights.delete_singleRight_success_message',
        { name: toPartyName, resourceTitle: resource.title },
      ),
      color: 'success',
      duration: SnackbarDuration.normal,
    });
  };

  const handleAddResource = (resource: ServiceResource) =>
    delegate(resource, {
      onSuccess: (r) => onActionSuccess(r, 'delegate'),
      onError: (r, error) => {
        setActionError(error);
        onSelect(r, true);
      },
    });

  const handleRemoveResource = (resource: ServiceResource) =>
    remove(resource, {
      onSuccess: (r) => onActionSuccess(r, 'revoke'),
      onError: (r, error) => {
        setActionError(error);
        onSelect(r, true);
      },
    });

  const renderControls = (resource: ServiceResource) => {
    const hasDelegatedResource = isDelegated(resource.identifier);
    const resourceLoading = isLoading(resource.identifier);

    if (hasDelegatedResource) {
      return (
        <DsButton
          variant='tertiary'
          data-size='sm'
          loading={resourceLoading}
          disabled={resourceLoading || isDelegatedResourcesFetching}
          onClick={(event) => {
            event.stopPropagation();
            setActionError(null);
            handleRemoveResource(resource);
          }}
          aria-label={t('common.delete_poa_for', { poa_object: resource.title })}
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
        loading={resourceLoading}
        disabled={resourceLoading || isDelegatedResourcesFetching || resource.delegable === false}
        onClick={(event) => {
          event.stopPropagation();
          setActionError(null);
          handleAddResource(resource);
        }}
        aria-label={t('common.give_poa_for', { poa_object: resource.title })}
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
      <div className={classes.resourceSearchContainer}>
        {isFetching ? (
          <div>
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
            <ScopeList
              showResultsCount
              totalResultsCount={totalNumberOfResults}
              resources={resources}
              onSelect={onSelect}
              getHasAccess={(resource) => isDelegated(resource.identifier)}
              renderControls={renderControls}
              search={searchString}
              setSearch={setSearch}
              filterState={filters}
              setFilterState={(nextFilters) => {
                setFilters(nextFilters);
                setCurrentPage(1);
              }}
              serviceOwnerOptions={filterOptions}
              emptyState={
                <DsParagraph data-size='md'>
                  {searchString
                    ? t('resource_list.no_resources_filtered', { searchTerm: searchString })
                    : t('maskinporten_page.no_scopes')}
                </DsParagraph>
              }
            />
            {totalNumberOfResults !== undefined && totalNumberOfResults > searchResultsPerPage && (
              <AmPagination
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
