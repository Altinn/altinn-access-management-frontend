import React from 'react';
import { FilterState, Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface ResourceFilterToolbarProps {
  search: string;
  setSearch: (search: string) => void;
  filterState: string[];
  setFilterState: (newValue: string[]) => void;
  serviceOwnerOptions: { value: string; label: string; count?: number }[];
}
const OWNER_FILTER_KEY = 'owner';

export const ResourceFilterToolbar = ({
  search,
  setSearch,
  filterState,
  setFilterState,
  serviceOwnerOptions,
}: ResourceFilterToolbarProps) => {
  const { t } = useTranslation();

  const filterStateWithOwner = React.useMemo(
    () => ({ [OWNER_FILTER_KEY]: filterState }),
    [filterState],
  );

  const onFilterStateChange = (newFilterState: FilterState) => {
    setFilterState((newFilterState[OWNER_FILTER_KEY] as string[]) ?? []);
  };

  return (
    <Toolbar
      search={{
        name: 'search',
        value: search,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
        label: t('resource_list.resource_search_placeholder'),
        placeholder: t('resource_list.resource_search_placeholder'),
        clearButtonAltText: t('resource_list.resource_search_clear'),
        onClear: () => setSearch(''),
      }}
      filter={{
        filterState: filterStateWithOwner,
        onFilterStateChange: onFilterStateChange,
        getFilterLabel: (_name, value) => {
          const serviceOwners = serviceOwnerOptions
            .filter((owner) => value?.includes(owner.value))
            .map((owner) => owner.label);
          return serviceOwners.length
            ? serviceOwners.join(', ')
            : t('resource_list.filter_by_serviceowner');
        },
        filters: [
          {
            id: OWNER_FILTER_KEY,
            name: OWNER_FILTER_KEY,
            title: t('resource_list.filter_by_serviceowner'),
            label: t('resource_list.filter_by_serviceowner'),
            removable: false,
            searchable: true,
            search: {
              placeholder: t('resource_list.service_owner_filter'),
              name: 'search-service-owner',
              clearButtonAltText: t('resource_list.service_owner_filter_clear'),
            },
            items: serviceOwnerOptions.map((owner) => ({
              value: owner.value,
              name: OWNER_FILTER_KEY,
              role: 'checkbox',
              count: owner.count,
              label: `${owner.label}${owner.count ? ` (${owner.count})` : ''}`,
              searchWords: [owner.label],
            })),
          },
        ],
      }}
    />
  );
};
