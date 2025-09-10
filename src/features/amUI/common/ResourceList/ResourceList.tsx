import React from 'react';
import { List, ResourceListItem, DsSearch, DsParagraph, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';
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
  const [selected, setSelected] = React.useState<PackageResource | null>(null);
  const { data: orgData, isLoading: orgLoading } = useGetOrgDataQuery();

  const onSelect = (res: PackageResource) => {
    setSelected(res);
  };

  const onClose = () => setSelected(null);

  const {
    resources: filtered,
    hasNextPage,
    goNextPage,
  } = useFilteredResources({
    resources,
    searchString: search,
  });

  const getProviderLogoUrl = (orgCode: string | null): string | undefined => {
    if (!orgData || orgLoading) return undefined;
    const org = orgCode ? orgData[orgCode] : undefined;
    return org?.emblem ?? org?.logo ?? undefined;
  };

  return (
    <div className={classes.container}>
      <DsSearch className={classes.searchBar}>
        <DsSearch.Input
          disabled={resources.length === 0}
          aria-label={t('package_resource_list.resource_search_placeholder')}
          placeholder={t('package_resource_list.resource_search_placeholder')}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        {search && <DsSearch.Clear onClick={() => setSearch('')} />}
      </DsSearch>
      {orgLoading || isLoading ? (
        <SkeletonResourceList />
      ) : (
        <>
          {resources.length === 0 && (
            <DsParagraph data-size='md'>
              {noResourcesText || t('package_resource_list.no_resources')}
            </DsParagraph>
          )}
          {resources.length > 0 && filtered.length === 0 && (
            <DsParagraph data-size='md'>
              {t('package_resource_list.no_resources_filtered', { searchTerm: search })}
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
                    ownerName={resource.provider?.name || resource.resourceOwnerName}
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
                onClick={goNextPage}
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
