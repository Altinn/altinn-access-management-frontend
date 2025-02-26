import * as React from 'react';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';

import type { Party } from '@/rtk/features/lookupApi';

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
