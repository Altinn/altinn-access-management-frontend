import React from 'react';
import {
  type BadgeProps,
  List,
  ResourceListItem,
  type ResourceListItemProps,
} from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { useRestoreFocusTarget } from '../RestoreFocus';

export interface ClientResourceListItemData {
  id: string;
  resource: ServiceResource;
  variant?: string;
  color?: string;
  titleAs?: ResourceListItemProps['titleAs'];
  controls?: React.ReactNode;
  badge?: BadgeProps;
  onClick?: () => void;
}

interface ClientResourceListItemsProps {
  items: ClientResourceListItemData[];
  labelledBy?: string;
}

const ClientResourceListRow = (item: ClientResourceListItemData) => {
  useRestoreFocusTarget(item.id);

  return (
    <ResourceListItem
      id={item.id}
      size='sm'
      resourceName={item.resource.title ?? ''}
      ownerName={item.resource.resourceOwnerName ?? ''}
      ownerLogoUrl={item.resource.resourceOwnerLogoUrl || undefined}
      ownerLogoUrlAlt={item.resource.resourceOwnerName ?? ''}
      titleAs={item.titleAs}
      interactive={!!item.onClick}
      as={item.onClick ? 'button' : 'div'}
      variant={item.variant}
      color={item.color}
      badge={item.badge}
      onClick={item.onClick}
      controls={item.controls}
    />
  );
};

export const ClientResourceListItems = ({ items, labelledBy }: ClientResourceListItemsProps) => {
  return (
    <List aria-labelledby={labelledBy}>
      {items.map((item) => (
        <ClientResourceListRow
          key={item.id}
          {...item}
        />
      ))}
    </List>
  );
};
