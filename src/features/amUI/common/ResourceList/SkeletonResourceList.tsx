import React from 'react';
import { List, ResourceListItem, ResourceListItemProps } from '@altinn/altinn-components';

export const SkeletonResourceList = ({ count = 3 }: { count?: number }) => {
  const resourceSkeletons: ResourceListItemProps[] = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        ownerName: 'xxxxxxxxx xxxxxxxxxxx',
        resourceName: 'xxxxxxxxxxxxxxxxxxxx',
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
      {...item}
    />
  ));

  return <List>{items}</List>;
};
