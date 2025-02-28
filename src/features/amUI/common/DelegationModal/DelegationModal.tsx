import * as React from 'react';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';

export enum DelegationType {
  SingleRights = 'SingleRights',
  AccessPackage = 'AccessPackage',
  Role = 'Role',
}
export interface DelegationModalProps {
  toPartyUuid: string;
  fromPartyUuid: string;
  delegationType: DelegationType;
}

export const DelegationModal = ({
  toPartyUuid,
  fromPartyUuid,
  delegationType,
}: DelegationModalProps) => {
  return (
    <DelegationModalProvider>
      <DelegationModalContent
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
        delegationType={delegationType}
      />
    </DelegationModalProvider>
  );
};
