import React from 'react';
import { List, ResourceListItem, ResourceListItemProps } from '@altinn/altinn-components';

export const SkeletonResourceList = ({ count = 5 }: { count?: number }) => {
  const resourceSkeletons: ResourceListItemProps[] = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        ownerName: 'xxxxxxxxxxxxxxxxxxxx',
        resourceName: 'xxxxxxxxxxxxxxxxxxxx',
        ownerLogoUrl: '',
        badge: undefined,
      })),
    [count],
  );

  const items = resourceSkeletons.map((item) => (
    <ResourceListItem
      key={item.id}
      loading
      as='div'
      interactive={false}
      shadow='none'
      ownerLogoUrlAlt=''
      {...item}
    />
  ));

  return <List>{items}</List>;
};
