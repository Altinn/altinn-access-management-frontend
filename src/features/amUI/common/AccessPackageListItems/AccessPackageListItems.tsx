import React from 'react';
import type { AccessPackageListItemProps } from '@altinn/altinn-components';
import { AccessPackageListItem, List } from '@altinn/altinn-components';

export type AccessPackageListItemData = AccessPackageListItemProps;

interface AccessPackageListItemsProps {
  items: AccessPackageListItemData[];
}

export const AccessPackageListItems = ({ items }: AccessPackageListItemsProps) => {
  return (
    <List>
      {items.map((item) => (
        <AccessPackageListItem
          key={item.id}
          {...item}
          interactive={false}
        />
      ))}
    </List>
  );
};
