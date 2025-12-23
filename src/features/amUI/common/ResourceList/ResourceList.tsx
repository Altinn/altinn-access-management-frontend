import React from 'react';
import { List, ResourceListItem, DsParagraph, Button, Toolbar } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';
import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { ResourceDetails } from './ResourceDetails';
import classes from './ResourceList.module.css';
import { SkeletonResourceList } from './SkeletonResourceList';
import { useFilteredResources } from './useFilteredResources';

interface PackageResourceListProps {
  resources: PackageResource[];
  noResourcesText?: string;
  isLoading?: boolean;
}

export const ResourceList = ({
  resources,
  noResourcesText,
  isLoading,
}: PackageResourceListProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = React.useState('');
  const [filterState, setFilterState] = React.useState<{ owner?: string[] }>({});
  const [selected, setSelected] = React.useState<PackageResource | null>(null);
  const { getProviderLogoUrl, isLoading: orgLoading } = useProviderLogoUrl();

  const onSelect = (res: PackageResource) => {
    setSelected(res);
  };

  const onClose = () => setSelected(null);

  const {
    resources: filtered,
    hasNextPage,
    loadNextPage,
  } = useFilteredResources({
    resources,
    searchString: search,
    serviceOwnerFilter: filterState?.['owner']?.[0],
  });

  return (
    <div className={classes.container}>
      {resources.length > 0 && (
        <Toolbar
          search={{
            name: 'search',
            value: search,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
            label: t('resource_list.resource_search_placeholder'),
            placeholder: t('resource_list.resource_search_placeholder'),
            onClear: () => setSearch(''),
          }}
          filterState={filterState}
          onFilterStateChange={setFilterState}
          getFilterLabel={(_name, value) => {
            return (
              resources.find((res) => res.resourceOwnerOrgcode === value?.[0])?.resourceOwnerName ||
              ''
            );
          }}
          addFilterButtonLabel={t('resource_list.filter_by_serviceowner')}
          filters={[
            {
              name: 'owner',
              label: t('resource_list.filter_by_serviceowner'),
              optionType: 'radio',
              removable: true,
              options: Array.from(
                new Map(
                  resources.map((resource) => [
                    resource.resourceOwnerOrgcode,
                    {
                      value: resource.resourceOwnerOrgcode,
                      label: resource.resourceOwnerName,
                    },
                  ]),
                ).values(),
              ),
            },
          ]}
        />
      )}
      {orgLoading || isLoading ? (
        <SkeletonResourceList />
      ) : (
        <>
          {resources.length === 0 && (
            <DsParagraph data-size='md'>
              {noResourcesText || t('resource_list.no_resources')}
            </DsParagraph>
          )}
          {resources.length > 0 && filtered.length === 0 && (
            <DsParagraph data-size='md'>
              {t('resource_list.no_resources_filtered', { searchTerm: search })}
            </DsParagraph>
          )}
          {filtered.length > 0 && (
            <List>
              {filtered.map((resource) => {
                const emblem = getProviderLogoUrl(
                  resource.provider?.code ?? resource.resourceOwnerOrgcode ?? '',
                );
                return (
                  <ResourceListItem
                    key={resource.id}
                    id={resource.id}
                    as='button'
                    size='xs'
                    resourceName={resource.name || resource.title}
                    ownerName={resource.provider?.name || resource.resourceOwnerName || ''}
                    ownerLogoUrl={
                      emblem ?? resource.provider?.logoUrl ?? resource.resourceOwnerLogoUrl
                    }
                    ownerLogoUrlAlt={resource.provider?.name || resource.resourceOwnerName}
                    onClick={() => onSelect(resource)}
                    titleAs='h3'
                  />
                );
              })}
            </List>
          )}
          {hasNextPage && (
            <div className={classes.showMoreButtonContainer}>
              <Button
                className={classes.showMoreButton}
                onClick={loadNextPage}
                variant='outline'
                size='md'
              >
                {t('common.show_more')}
              </Button>
            </div>
          )}
        </>
      )}
      <ResourceDetails
        resource={selected}
        onClose={onClose}
        providerLogoUrl={getProviderLogoUrl(
          selected?.provider?.code ?? selected?.resourceOwnerOrgcode ?? '',
        )}
      />
    </div>
  );
};
