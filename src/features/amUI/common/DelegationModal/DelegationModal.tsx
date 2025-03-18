import * as React from 'react';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';
import type { DelegationAction } from './EditModal';

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
    <DelegationModalProvider>
      <DelegationModalContent
        delegationType={delegationType}
        availableActions={availableActions}
      />
    </DelegationModalProvider>
  );
};
