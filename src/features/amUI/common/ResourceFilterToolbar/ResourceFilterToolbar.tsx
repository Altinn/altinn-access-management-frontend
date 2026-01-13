import React from 'react';
import { Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface ResourceFilterToolbarProps {
  search: string;
  setSearch: (search: string) => void;
  filterState: { owner?: string[] };
  setFilterState: (state: { owner?: string[] }) => void;
  serviceOwnerOptions: { value: string; label: string }[];
}

export const ResourceFilterToolbar = ({
  search,
  setSearch,
  filterState,
  setFilterState,
  serviceOwnerOptions,
}: ResourceFilterToolbarProps) => {
  const { t } = useTranslation();

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
      filterState={filterState}
      onFilterStateChange={setFilterState}
      getFilterLabel={(_name, value) => {
        const serviceOwners = serviceOwnerOptions
          .filter((owner) => value?.includes(owner.value))
          .map((owner) => owner.label);
        return serviceOwners ? serviceOwners.join(', ') : '';
      }}
      addFilterButtonLabel={t('resource_list.filter_by_serviceowner')}
      removeButtonAltText={t('resource_list.remove_filter')}
      filters={
        serviceOwnerOptions.length > 0
          ? [
              {
                name: 'owner',
                label: t('resource_list.filter_by_serviceowner'),
                optionType: 'checkbox',
                removable: false,
                options: serviceOwnerOptions,
              },
            ]
          : []
      }
    />
  );
};
