import * as React from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';

export enum DelegationType {
  SingleRights = 'SingleRights',
  AccessPackage = 'AccessPackage',
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
