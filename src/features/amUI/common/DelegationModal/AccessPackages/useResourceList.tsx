import * as React from 'react';
import { ResourceListItem } from '@altinn/altinn-components';

import type { PackageResource } from '@/rtk/features/accessPackageApi';
import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';

export const useResourceList = (list: PackageResource[]) => {
  const { data: orgData, isLoading: orgDataIsLoading } = useGetOrgDataQuery();

  const getProviderLogoUrl = (orgCode: string | null): string | undefined => {
    if (!orgData || orgDataIsLoading) {
      return undefined;
    }
    const org = orgCode ? orgData[orgCode] : undefined;
    return org?.emblem ?? org?.logo ?? undefined;
  };

  const resourceListItems = list.map((resource) => {
    const emblem = getProviderLogoUrl(resource.provider?.code ?? '');
    return (
      <ResourceListItem
        key={resource.id}
        id={resource.id}
        loading={orgDataIsLoading}
        resourceName={resource.name}
        ownerName={resource.provider.name}
        ownerLogoUrl={emblem ?? resource.provider.logoUrl}
        ownerLogoUrlAlt={resource.provider.name}
        as='div'
        size='xs'
        interactive={false}
        shadow='none'
      />
    );
  });

  return resourceListItems;
};
