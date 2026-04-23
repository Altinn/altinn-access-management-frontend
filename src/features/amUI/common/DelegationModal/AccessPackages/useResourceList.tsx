import * as React from 'react';
import { ResourceListItem } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

export const useResourceList = (list: PackageResource[]) => {
  const { getProviderLogoUrl, isLoading } = useProviderLogoUrl();

  const resourceListItems = list.map((resource) => {
    const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');

    return (
      <ResourceListItem
        key={resource.identifier}
        id={resource.identifier}
        loading={isLoading}
        resourceName={resource.title}
        ownerName={resource.resourceOwnerName}
        ownerLogoUrl={emblem ?? resource.resourceOwnerLogoUrl}
        ownerLogoUrlAlt={resource.resourceOwnerName}
        as='div'
        size='xs'
        interactive={false}
        shadow='none'
      />
    );
  });

  return resourceListItems;
};
