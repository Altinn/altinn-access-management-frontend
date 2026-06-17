import React from 'react';
import type { AccessPackageListItemProps } from '@altinn/altinn-components';
import { AccessPackageListItem, List } from '@altinn/altinn-components';

import { useRestoreFocusTarget } from '../RestoreFocus';
import { clientPackageActionFocusId } from './clientPackageFocusIds';

export type AccessPackageListItemData = AccessPackageListItemProps;

interface AccessPackageListItemsProps {
  items: AccessPackageListItemData[];
}

// Registers the row and its inline action button as RestoreFocus targets, so focus is restored to
// the row when the info modal closes and to the "Gi"/"Slett" button after an inline swap. No-op when
// rendered outside a RestoreFocusProvider.
const AccessPackageListItemWithFocus = ({ item }: { item: AccessPackageListItemData }) => {
  useRestoreFocusTarget(item.id);
  useRestoreFocusTarget(clientPackageActionFocusId(item.id));
  return (
    <AccessPackageListItem
      {...item}
      interactive={item.interactive ?? false}
    />
  );
};

export const AccessPackageListItems = ({ items }: AccessPackageListItemsProps) => {
  return (
    <List>
      {items.map((item) => (
        <AccessPackageListItemWithFocus
          key={item.id}
          item={item}
        />
      ))}
    </List>
  );
};
