import * as React from 'react';

import type { Party } from '@/rtk/features/lookupApi';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';

export enum DelegationType {
  SingleRights = 'SingleRights',
  AccessPackage = 'AccessPackage',
  Role = 'Role',
}
export interface DelegationModalProps {
  toParty: Party;
  delegationType: DelegationType;
}

export const DelegationModal = ({ toParty, delegationType }: DelegationModalProps) => {
  return (
    <DelegationModalProvider>
      <DelegationModalContent
        toParty={toParty}
        delegationType={delegationType}
      />
    </DelegationModalProvider>
  );
};
