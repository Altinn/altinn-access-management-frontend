import * as React from 'react';

import { DelegationModalContent } from './DelegationModalContent';
import type { DelegationAction } from './EditModal';
import { AreaExpandedStateProvider } from '../AccessPackageList/AccessPackageExpandedContext';

export enum DelegationType {
  SingleRights = 'SingleRights',
  AccessPackage = 'AccessPackage',
  Role = 'Role',
}
export interface DelegationModalProps {
  delegationType: DelegationType;
  availableActions?: DelegationAction[];
}

export const DelegationModal = ({ delegationType, availableActions }: DelegationModalProps) => {
  return (
    <AreaExpandedStateProvider>
      <DelegationModalContent
        delegationType={delegationType}
        availableActions={availableActions}
      />
    </AreaExpandedStateProvider>
  );
};
