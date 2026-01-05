import React from 'react';
import { PackageResource } from '@/rtk/features/accessPackageApi';
import { Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

interface AccessPackageResourceToolbarProps {
  search: string;
  setSearch: (search: string) => void;
  filterState: { owner?: string[] };
  setFilterState: (state: { owner?: string[] }) => void;
  resources: PackageResource[];
}

export const AccessPackageResourceToolbar = ({
  search,
  setSearch,
  filterState,
  setFilterState,
  resources,
}: AccessPackageResourceToolbarProps) => {
  const { t } = useTranslation();

  if (resources.length === 0) {
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
        const resourceWithOwner = resources.find(
          (res) => getResourceOwnerOrgcode(res) === value?.[0],
        );
        return resourceWithOwner ? getResourceOwnerName(resourceWithOwner) : '';
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
              resources.map((resource) => [
                getResourceOwnerOrgcode(resource),
                {
                  value: getResourceOwnerOrgcode(resource),
                  label: getResourceOwnerName(resource),
                },
              ]),
            ).values(),
          ),
        },
      ]}
    />
  );
};

const getResourceOwnerOrgcode = (resource: PackageResource): string => {
  return resource.provider?.code || resource.resourceOwnerOrgcode || '';
};
const getResourceOwnerName = (resource: PackageResource): string => {
  return resource.provider?.name || resource.resourceOwnerName || '';
};
