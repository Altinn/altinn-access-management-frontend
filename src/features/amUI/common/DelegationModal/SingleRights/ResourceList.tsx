import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceListItem } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

interface ResourceListProps {
  resources: ServiceResource[];
  delegatedResources?: any[];
  onSelect: (resource: ServiceResource) => void;
}

export const ResourceList = ({ resources, delegatedResources, onSelect }: ResourceListProps) => {
  const { t } = useTranslation();
  const { getProviderLogoUrl } = useProviderLogoUrl();

  return (
    <>
      {resources.map((resource: ServiceResource, index: number) => {
        const hasPoa =
          !!delegatedResources &&
          delegatedResources.some(
            (delegation) => delegation.resource?.identifier === resource.identifier,
          );
        const emblem = getProviderLogoUrl(resource.resourceOwnerOrgcode ?? '');
        console.log('resource: ', resource);
        console.log('emblem: ', emblem);
        return (
          <ResourceListItem
            key={resource.identifier ?? index}
            id={resource.identifier}
            ownerName={resource.resourceOwnerName ?? ''}
            resourceName={resource.title}
            ownerLogoUrl={emblem ?? resource.resourceOwnerLogoUrl}
            ownerLogoUrlAlt={resource.resourceOwnerName}
            as='button'
            onClick={() => onSelect(resource)}
            badge={
              hasPoa ? { label: t('common.has_poa'), theme: 'base', color: 'success' } : undefined
            }
          />
        );
      })}
    </>
  );
};
