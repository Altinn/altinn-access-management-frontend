import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsParagraph } from '@altinn/altinn-components';
import {
  useSearchResourcesInfiniteQuery,
  useGetSingleRightsForRightholderQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { PermissionsBadge } from '../common/PermissionsBadge/PermissionsBadge';
import classes from './SingleRightsPermissions.module.css';
import type { Permissions } from '@/dataObjects/dtos/accessPackage';
import { ResourceFilterToolbar } from '../common/ResourceFilterToolbar/ResourceFilterToolbar';
import { CollapsibleContainer } from '../common/CollapsibleContainer/CollapsibleContainer';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { useDebouncedValue, usePermissionOverview } from '@/resources/hooks';
import { useFilteredResources } from '../common/ResourceList/useFilteredResources';
import {
  extractResourceName,
  extractOwnerName,
  extractOrgCode,
  extractDescription,
  isExpiredResource,
} from '../common/ResourceList/utils';

const searchResultsPerPage = 7;
const ASSIGNED_SERVICES_SECTION = 'assigned-services-section';
const UNASSIGNED_SERVICES_SECTION = 'unassigned-services-section';

export const SingleRightsPermissions = () => {
  const { t } = useTranslation();
  const { actingParty, fromParty, isLoading: isPartyLoading } = usePartyRepresentation();

  // Only the debounced search value lives here. The raw, per-keystroke value is owned by
  // ServicesToolbar so that typing does not re-render the service lists below.
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterState, setFilterState] = useState<string[]>([]);

  // No `to` is passed: the overview lists services delegated from the reportee to anyone.
  const {
    data: delegations,
    isLoading,
    isError,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid,
    },
  );

  const {
    data: searchData,
    isFetching: isSearchFetching,
    isError: isSearchError,
    hasNextPage,
    fetchNextPage,
  } = useSearchResourcesInfiniteQuery({
    searchString: debouncedSearch,
    ROfilters: filterState,
    resultsPerPage: searchResultsPerPage,
    includeA2Services: false,
    includeExpired: true,
  });

  const delegatedIds = useMemo(
    () => new Set((delegations ?? []).map((d) => d.resource.identifier)),
    [delegations],
  );

  // `pages` accumulates every page fetched so far for the current search arguments.
  const searchResources = useMemo(() => {
    return (searchData?.pages.flatMap((p) => p.pageList) ?? []).filter(
      (r) => !delegatedIds.has(r.identifier),
    );
  }, [searchData, delegatedIds]);

  const resources = useMemo(
    () => (delegations ?? []).map((delegation) => delegation.resource).filter(Boolean),
    [delegations],
  );

  const permissionsByResource = useMemo(
    () => new Map((delegations ?? []).map((d) => [d.resource?.identifier, d.permissions])),
    [delegations],
  );

  const { resources: filteredResources } = useFilteredResources({
    resources,
    serviceOwnerFilter: filterState,
    searchString: debouncedSearch,
    includeExpiredResources: true,
    getResourceName: extractResourceName,
    getOwnerName: extractOwnerName,
    getOwnerOrgCode: extractOrgCode,
    getDescription: extractDescription,
    isExpiredResource: isExpiredResource,
  });

  const hasSearch = debouncedSearch || filterState.length > 0;

  if (isError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <>
      <DsParagraph className={classes.description}>
        {t('poa_overview_page.services_tab.description')}
      </DsParagraph>
      <ServicesToolbar
        onSearchChange={setDebouncedSearch}
        filterState={filterState}
        setFilterState={setFilterState}
      />
      <section aria-labelledby={ASSIGNED_SERVICES_SECTION}>
        <CollapsibleContainer
          heading={t('poa_overview_page.services_tab.assigned_services_title')}
          searchString={debouncedSearch}
          id={ASSIGNED_SERVICES_SECTION}
          defaultOpen
        >
          <ResourceList
            resources={filteredResources}
            isLoading={isLoading || isPartyLoading}
            enableSearch={false}
            showDetails={false}
            noResourcesText={
              hasSearch
                ? t('poa_overview_page.services_tab.no_services_found')
                : t('poa_overview_page.services_tab.no_services')
            }
            renderControls={(resource) => {
              const permissions = permissionsByResource.get(resource.identifier);
              return permissions?.length ? (
                <SingleRightsPermissionBadge permissions={permissions} />
              ) : null;
            }}
          />
        </CollapsibleContainer>
      </section>
      <section aria-labelledby={UNASSIGNED_SERVICES_SECTION}>
        <CollapsibleContainer
          heading={t('poa_overview_page.services_tab.other_services_title')}
          searchString={debouncedSearch + filterState.join('')}
          id={UNASSIGNED_SERVICES_SECTION}
        >
          {isSearchError ? (
            <DsAlert
              role='alert'
              data-color='danger'
            >
              <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
            </DsAlert>
          ) : (
            <>
              <ResourceList
                resources={searchResources}
                isLoading={isSearchFetching && searchResources.length === 0}
                enableSearch={false}
                showDetails={false}
                noResourcesText={t('poa_overview_page.services_tab.no_other_services')}
              />
              {hasNextPage && (
                <div className={classes.showMoreButton}>
                  <DsButton
                    variant='secondary'
                    data-size='sm'
                    onClick={() => {
                      if (!isSearchFetching) {
                        fetchNextPage();
                      }
                    }}
                    aria-disabled={isSearchFetching}
                  >
                    {t('common.show_more')}
                  </DsButton>
                </div>
              )}
            </>
          )}
        </CollapsibleContainer>
      </section>
    </>
  );
};

interface ServicesToolbarProps {
  onSearchChange: (search: string) => void;
  filterState: string[];
  setFilterState: (filters: string[]) => void;
}

/**
 * Owns the raw search input value and reports it upwards only once debounced.
 *
 * Keeping the per-keystroke value out of SingleRightsPermissions matters for more than the
 * request count: everything below the toolbar (both service lists, and a popover plus avatar
 * group per row) is keyed on the debounced value, so re-rendering it on each keystroke is
 * work that cannot change the output. Clearing the field applies immediately.
 */
const ServicesToolbar = ({ onSearchChange, filterState, setFilterState }: ServicesToolbarProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, search ? 300 : 0);
  const { data: ROdata } = useGetResourceOwnersQuery();

  // Memoised so typing, which re-renders only this component, doesn't rebuild the service
  // owner list on every keystroke: ResourceFilterToolbar turns it into one filter item per
  // owner, and altinn-components clones that list again on each render.
  const serviceOwnerOptions = useMemo(() => {
    return (ROdata ?? []).map((ro) => ({
      label: ro.organisationName || ro.organisationCode,
      value: ro.organisationCode,
    }));
  }, [ROdata]);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <ResourceFilterToolbar
      search={search}
      setSearch={setSearch}
      filterState={filterState}
      setFilterState={setFilterState}
      serviceOwnerOptions={serviceOwnerOptions}
    />
  );
};

interface SingleRightsPermissionBadgeProps {
  permissions: Permissions[];
}

const SingleRightsPermissionBadge = ({ permissions }: SingleRightsPermissionBadgeProps) => {
  const { permissionsOverview } = usePermissionOverview({
    permissions: permissions ?? [],
  });
  return <PermissionsBadge permissions={permissionsOverview} />;
};
