import React from 'react';
import { List, ResourceListItem, type ResourceListItemProps } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { extractLogoUrl, extractOwnerName, extractResourceName } from '../ResourceList/utils';

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
          resourceName={extractResourceName(item.resource)}
          ownerName={extractOwnerName(item.resource)}
          ownerLogoUrl={extractLogoUrl(item.resource)}
          ownerLogoUrlAlt={extractOwnerName(item.resource)}
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
