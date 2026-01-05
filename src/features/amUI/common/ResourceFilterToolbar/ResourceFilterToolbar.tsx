import React from 'react';
import { PackageResource } from '@/rtk/features/accessPackageApi';
import { Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface ResourceFilterToolbarProps {
  search: string;
  setSearch: (search: string) => void;
  filterState: { owner?: string[] };
  setFilterState: (state: { owner?: string[] }) => void;
  resourceOptions: { value: string; label: string }[];
}

export const ResourceFilterToolbar = ({
  search,
  setSearch,
  filterState,
  setFilterState,
  resourceOptions,
}: ResourceFilterToolbarProps) => {
  const { t } = useTranslation();

  if (resourceOptions.length === 0) {
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
        const resourceWithOwner = resourceOptions.find((res) => res.value === value?.[0]);
        return resourceWithOwner ? resourceWithOwner.label : '';
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
              resourceOptions.map((option) => [
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
