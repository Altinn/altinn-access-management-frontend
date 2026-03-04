import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { ResourceList } from '../common/ResourceList/ResourceList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  ServiceResource,
  useGetDelegatedResourcesQuery,
  useGetPaginatedSearchQuery,
} from '@/rtk/features/singleRights/singleRightsApi';
import { amUIPath } from '@/routes/paths';
import { DebouncedSearchField } from '../common/DebouncedSearchField/DebouncedSearchField';

export const ServicePermissions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { actingParty, fromParty } = usePartyRepresentation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');
  const hasSearch = debouncedSearchString.trim().length > 0;

  const {
    data: delegatedResources,
    isLoading,
    isError,
  } = useGetDelegatedResourcesQuery(
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
    isFetching: isFetchingSearch,
    isError: isSearchError,
  } = useGetPaginatedSearchQuery(
    {
      searchString: debouncedSearchString,
      ROfilters: [],
      page: 1,
      resultsPerPage: 100,
      includeA2Services: false,
      includeMigratedApps: false,
    },
    {
      skip: !hasSearch,
    },
  );

  const delegatedServices = useMemo(() => {
    const uniqueResources = new Map<string, ServiceResource>();

    delegatedResources?.forEach((delegation) => {
      const resource = delegation.resource;
      if (!resource) {
        return;
      }

      if (!uniqueResources.has(resource.identifier)) {
        uniqueResources.set(resource.identifier, resource);
      }
    });

    return Array.from(uniqueResources.values());
  }, [delegatedResources]);

  const services = hasSearch ? (searchData?.pageList ?? []) : delegatedServices;

  if (isError || (hasSearch && isSearchError)) {
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
      <DebouncedSearchField
        placeholder={t('resource_list.resource_search_placeholder')}
        setDebouncedSearchString={setDebouncedSearchString}
      />
      <ResourceList
        isLoading={isLoading || (hasSearch && isFetchingSearch)}
        resources={services}
        noResourcesText={
          hasSearch
            ? t('resource_list.no_resources_filtered', { searchTerm: debouncedSearchString })
            : t('poa_overview_page.services_tab.no_resources')
        }
        onSelect={(resource) =>
          navigate(
            `/${amUIPath.PoaServiceDetails.replace(':id', encodeURIComponent(resource.identifier))}`,
            {
              state: { resource },
            },
          )
        }
        showDetails={false}
        size='md'
        titleAs='h3'
        enableSearch={false}
      />
    </>
  );
};
