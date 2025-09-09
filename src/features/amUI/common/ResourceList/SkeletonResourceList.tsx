import React from 'react';
import { List, ResourceListItem, ResourceListItemProps } from '@altinn/altinn-components';

export const SkeletonResourceList = ({ count = 5 }: { count?: number }) => {
  const resourceSkeletons = [
    {
      id: '1',
      ownerName: 'xxxxxxxxxxxxxxxxxxxx',
      resourceName: 'xxxxxxxxxxxxxxxxxxxx',
      ownerLogoUrl: '',
      badge: 'xxxxxxxxxxxxxxxxxxxx',
    },
    {
      id: '2',
      ownerName: 'xxxxxxxxxxxxxxxxxxxx',
      resourceName: 'xxxxxxxxxxxxxxxxxxxx',
      ownerLogoUrl: '',
      badge: undefined,
    },
    {
      id: '3',
      ownerName: 'xxxxxxxxxxxxxxxxxxxx',
      resourceName: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      ownerLogoUrl: 'xxxxxxxxxxxxxxxxxxxx',
      badge: undefined,
    },
  ] as ResourceListItemProps[];

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
