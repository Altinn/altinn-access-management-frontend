import React from 'react';
import type { AccessPackageListItemProps } from '@altinn/altinn-components';
import { AccessPackageListItem, List } from '@altinn/altinn-components';

import { useRestoreFocusTarget } from '../RestoreFocus';

export type AccessPackageListItemData = AccessPackageListItemProps;

interface AccessPackageListItemsProps {
  items: AccessPackageListItemData[];
  labelledBy?: string;
}

const AccessPackageListRow = (item: AccessPackageListItemData) => {
  useRestoreFocusTarget(item.id);
  return (
    <AccessPackageListItem
      {...item}
      interactive={item.interactive ?? false}
    />
  );
};

export const AccessPackageListItems = ({ items, labelledBy }: AccessPackageListItemsProps) => {
  return (
    <List aria-labelledby={labelledBy}>
      {items.map((item) => (
        <AccessPackageListRow
          key={item.id}
          {...item}
        />
      ))}
    </List>
  );
};
