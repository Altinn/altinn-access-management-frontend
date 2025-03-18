import * as React from 'react';

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
    <DelegationModalContent
      delegationType={delegationType}
      availableActions={availableActions}
    />
  );
};
