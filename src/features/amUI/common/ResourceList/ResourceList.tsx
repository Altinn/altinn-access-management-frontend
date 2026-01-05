import React from 'react';
import { List, ResourceListItem, DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';
import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { ResourceDetails } from './ResourceDetails';
import classes from './ResourceList.module.css';
import { SkeletonResourceList } from './SkeletonResourceList';
import { useFilteredResources } from './useFilteredResources';
import { AccessPackageResourceToolbar } from '../AccessPackageResourceToolbar/AccessPackageResourceToolbar';

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

  const { resources: filteredResources } = useFilteredResources({
    resources,
    searchString: search,
    serviceOwnerFilter: filterState?.['owner']?.[0],
  });

  return (
    <div className={classes.container}>
      {resources.length > 0 && (
        <AccessPackageResourceToolbar
          search={search}
          setSearch={setSearch}
          filterState={filterState}
          setFilterState={setFilterState}
          resources={resources}
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
          {resources.length > 0 && filteredResources.length === 0 && (
            <DsParagraph data-size='md'>
              {t('resource_list.no_resources_filtered', { searchTerm: search })}
            </DsParagraph>
          )}
          {filteredResources.length > 0 && (
            <List>
              {filteredResources.map((resource) => {
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
