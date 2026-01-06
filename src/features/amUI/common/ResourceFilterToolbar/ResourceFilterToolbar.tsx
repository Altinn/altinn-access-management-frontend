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

  if (serviceOwnerOptions.length === 0) {
    return null;
  }

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
        const serviceOwner = serviceOwnerOptions.find((owner) => owner.value === value?.[0]);
        return serviceOwner ? serviceOwner.label : '';
      }}
      addFilterButtonLabel={t('resource_list.filter_by_serviceowner')}
      removeButtonAltText={t('resource_list.remove_filter')}
      filters={[
        {
          name: 'owner',
          label: t('resource_list.filter_by_serviceowner'),
          optionType: 'radio',
          removable: true,
          options: Array.from(
            new Map(
              serviceOwnerOptions.map((option) => [
                option.value,
                {
                  value: option.value,
                  label: option.label,
                },
              ]),
            ).values(),
          ),
        },
      ]}
    />
  );
};
