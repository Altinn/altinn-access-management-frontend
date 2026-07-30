import React from 'react';
import type { AccessPackageListItemProps } from '@altinn/altinn-components';
import { AccessPackageListItem, List } from '@altinn/altinn-components';

export type AccessPackageListItemData = AccessPackageListItemProps;

interface AccessPackageListItemsProps {
  items: AccessPackageListItemData[];
  labelledBy?: string;
}

export const AccessPackageListItems = ({ items, labelledBy }: AccessPackageListItemsProps) => {
  return (
    <List aria-labelledby={labelledBy}>
      {items.map((item) => (
        <AccessPackageListItem
          key={item.id}
          {...item}
          interactive={item.interactive ?? false}
        />
      ))}
    </List>
  );
};
