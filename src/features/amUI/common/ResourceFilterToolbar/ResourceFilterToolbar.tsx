import React from 'react';
import { type FilterState, Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface ResourceFilterToolbarProps {
  search: string;
  setSearch: (search: string) => void;
  filterState: string[];
  setFilterState: (newValue: string[]) => void;
  serviceOwnerOptions: { value: string; label: string; count?: number }[];
  searchPlaceholder?: string;
}
const OWNER_FILTER_KEY = 'owner';
const ALL_SERVICE_OWNERS = 'all_service_owners_key';

export const ResourceFilterToolbar = ({
  search,
  setSearch,
  filterState,
  setFilterState,
  serviceOwnerOptions,
  searchPlaceholder,
}: ResourceFilterToolbarProps) => {
  const { t } = useTranslation();
  const placeholder = searchPlaceholder ?? t('resource_list.resource_search_placeholder');

  const [ownerSearch, setOwnerSearch] = React.useState('');

  // "Alle tjenesteeiere" is checked whenever no items are selected
  const filterStateWithOwner = React.useMemo(
    () => ({
      [OWNER_FILTER_KEY]: filterState.length > 0 ? filterState : [ALL_SERVICE_OWNERS],
    }),
    [filterState],
  );

  const onFilterStateChange = (newFilterState: FilterState) => {
    const newOwners = (newFilterState[OWNER_FILTER_KEY] as string[]) ?? [];
    const pickedAllServiceOwners = newOwners[newOwners.length - 1] === ALL_SERVICE_OWNERS;
    setFilterState(
      pickedAllServiceOwners ? [] : newOwners.filter((owner) => owner !== ALL_SERVICE_OWNERS),
    );
  };

  return (
    <Toolbar
      search={{
        name: 'search',
        value: search,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
        label: placeholder,
        placeholder: placeholder,
        clearButtonAltText: t('resource_list.resource_search_clear'),
        onClear: () => setSearch(''),
      }}
      filter={{
        filterState: filterStateWithOwner,
        onFilterStateChange: onFilterStateChange,
        getFilterLabel: (_name, value) => {
          const selectedOwners = (value ?? []).filter((owner) => owner !== ALL_SERVICE_OWNERS);
          if (selectedOwners.length > 1) {
            return t('resource_list.filtered_serviceowners', { count: selectedOwners.length });
          } else if (selectedOwners.length === 1) {
            return serviceOwnerOptions.find((owner) => owner.value === selectedOwners[0])?.label;
          }
          return t('resource_list.all_serviceowners');
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
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setOwnerSearch(e.target.value),
              onClear: () => setOwnerSearch(''),
            },
            groups: { all: { title: t('resource_list.choose_serviceowner') }, owners: {} },
            items: [
              ...(ownerSearch.trim().length > 0
                ? []
                : [
                    {
                      id: ALL_SERVICE_OWNERS,
                      value: ALL_SERVICE_OWNERS,
                      name: OWNER_FILTER_KEY,
                      groupId: 'all',
                      role: 'checkbox',
                      label: t('resource_list.all_serviceowners'),
                    },
                  ]),
              ...serviceOwnerOptions.map((owner) => ({
                id: owner.value,
                value: owner.value,
                name: OWNER_FILTER_KEY,
                groupId: 'owners',
                role: 'checkbox',
                count: owner.count,
                label: `${owner.label}${owner.count ? ` (${owner.count})` : ''}`,
                searchWords: [owner.label],
              })),
            ],
          },
        ],
      }}
    />
  );
};
