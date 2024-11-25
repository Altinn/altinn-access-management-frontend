import React from 'react';
import { ListItem } from '@altinn/altinn-components';
import { Paragraph } from '@digdir/designsystemet-react';

import type { AccessPackage, AccessPackageDelegation } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';

interface DelegatedPackagesListProps {
  /** The method to be called when clicking a package */
  onSelection: (item: AccessPackage) => void;
  /** The list of already delegated packages */
  packageDelegations: AccessPackageDelegation[];
  /** The complete list of packages that belong to the same area */
  accessPackages: AccessPackage[];
}

export const DelegatedPackagesList: React.FC<DelegatedPackagesListProps> = ({
  onSelection,
  packageDelegations,
  accessPackages,
}) => {
  const delegatedPackageIds = packageDelegations.map((p) => p.accessPackageId);
  const delegatedPackages = accessPackages.filter((p) => delegatedPackageIds.includes(p.id));
  const notDelegatedPackages = accessPackages.filter((p) => !delegatedPackageIds.includes(p.id));

  return (
    <>
      {delegatedPackages.length > 0 && (
        <List>
          {delegatedPackages.map((item) => (
            <li key={item.id}>
              <ListItem
                id={item.id}
                onClick={() => onSelection(item)}
                size='md'
                title={item.name}
                description={`${item.resources.length} tjenester`}
                color='accent'
              />
            </li>
          ))}
        </List>
      )}
      <Paragraph size='sm'>Andre tilganger under området:</Paragraph>
      {notDelegatedPackages.length > 0 && (
        <List>
          {notDelegatedPackages.map((item) => (
            <li key={item.id}>
              <ListItem
                id={item.id}
                onClick={() => onSelection(item)}
                size='md'
                title={item.name}
                description={`${item.resources.length} tjenester`}
                color='accent'
              />
            </li>
          ))}
        </List>
      )}
    </>
  );
};
