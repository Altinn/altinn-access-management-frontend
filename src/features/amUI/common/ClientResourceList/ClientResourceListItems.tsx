import React from 'react';
import { List, ResourceListItem, type ResourceListItemProps } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface ClientResourceListItemData {
  id: string;
  resource: ServiceResource;
  hasAccess: boolean;
  titleAs?: ResourceListItemProps['titleAs'];
  controls?: React.ReactNode;
  onClick?: () => void;
}

interface ClientResourceListItemsProps {
  items: ClientResourceListItemData[];
  labelledBy?: string;
}

export const ClientResourceListItems = ({ items, labelledBy }: ClientResourceListItemsProps) => {
  return (
    <List aria-labelledby={labelledBy}>
      {items.map((item) => (
        <ResourceListItem
          key={item.id}
          id={item.id}
          size='sm'
          resourceName={item.resource.title}
          ownerName={item.resource.resourceOwnerName}
          ownerLogoUrl={item.resource.resourceOwnerLogoUrl}
          ownerLogoUrlAlt={item.resource.resourceOwnerName}
          titleAs={item.titleAs}
          interactive={!!item.onClick}
          as={item.onClick ? 'button' : 'div'}
          variant={item.hasAccess ? 'tinted' : 'default'}
          onClick={item.onClick}
          controls={item.controls}
        />
      ))}
    </List>
  );
};
