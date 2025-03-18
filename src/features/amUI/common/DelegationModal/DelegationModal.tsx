import * as React from 'react';

import { DelegationModalContent } from './DelegationModalContent';
import type { DelegationAction } from './EditModal';

export enum DelegationType {
  SingleRights = 'SingleRights',
  AccessPackage = 'AccessPackage',
  Role = 'Role',
}
export interface DelegationModalProps {
  toPartyUuid: string;
  fromPartyUuid: string;
  delegationType: DelegationType;
  availableActions?: DelegationAction[];
}

export const DelegationModal = ({
  toPartyUuid,
  fromPartyUuid,
  delegationType,
  availableActions,
}: DelegationModalProps) => {
  return (
    <DelegationModalContent
      toPartyUuid={toPartyUuid}
      fromPartyUuid={fromPartyUuid}
      delegationType={delegationType}
      availableActions={availableActions}
    />
  );
};
