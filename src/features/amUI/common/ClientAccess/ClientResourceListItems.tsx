import React from 'react';
import { List, ResourceListItem, type ResourceListItemProps } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useProviderLogoUrl } from '@/resources/hooks/useProviderLogoUrl';

import {
  extractLogoUrl,
  extractOrgCode,
  extractOwnerName,
  extractResourceName,
} from '../ResourceList/utils';
import { useRestoreFocusTarget } from '../RestoreFocus';

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

const ClientResourceListRow = (item: ClientResourceListItemData) => {
  const { getProviderLogoUrl } = useProviderLogoUrl();
  useRestoreFocusTarget(item.id);

  return (
    <ResourceListItem
      id={item.id}
      size='sm'
      resourceName={extractResourceName(item.resource)}
      ownerName={extractOwnerName(item.resource)}
      ownerLogoUrl={
        getProviderLogoUrl(extractOrgCode(item.resource)) ?? extractLogoUrl(item.resource)
      }
      ownerLogoUrlAlt={extractOwnerName(item.resource)}
      titleAs={item.titleAs}
      interactive={!!item.onClick}
      as={item.onClick ? 'button' : 'div'}
      variant={item.hasAccess ? 'tinted' : 'default'}
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
