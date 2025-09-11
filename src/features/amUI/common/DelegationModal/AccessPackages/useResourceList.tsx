import * as React from 'react';
import { ResourceListItem } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

export const useResourceList = (list: PackageResource[]) => {
  const { getProviderLogoUrl, isLoading } = useProviderLogoUrl();

  const resourceListItems = list.map((resource) => {
    const emblem = getProviderLogoUrl(
      resource.provider?.code ?? resource.resourceOwnerOrgcode ?? '',
    );
    return (
      <ResourceListItem
        key={resource.id}
        id={resource.id}
        loading={isLoading}
        resourceName={resource.name || resource.title}
        ownerName={resource.provider?.name}
        ownerLogoUrl={emblem ?? resource.provider?.logoUrl}
        ownerLogoUrlAlt={resource.provider?.name}
        as='div'
        size='xs'
        interactive={false}
        shadow='none'
      />
    );
  });

  return resourceListItems;
};
