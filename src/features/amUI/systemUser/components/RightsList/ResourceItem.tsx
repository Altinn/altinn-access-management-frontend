import React from 'react';
import { ResourceListItem } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface ResourceItemProps {
  resource: ServiceResource;
  onClick: () => void;
  size: 'sm' | 'md';
}
export const ResourceItem = ({
  resource,
  onClick,
  size,
}: ResourceItemProps): React.ReactElement => {
  return (
    <ResourceListItem
      id={resource.identifier}
      ownerName={resource.resourceOwnerName}
      resourceName={resource.title}
      ownerLogoUrl={resource.resourceOwnerLogoUrl}
      ownerLogoUrlAlt={resource.resourceOwnerName}
      size={size}
      onClick={onClick}
    />
  );
};
