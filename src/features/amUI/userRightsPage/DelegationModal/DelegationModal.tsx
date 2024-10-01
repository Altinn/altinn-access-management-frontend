import * as React from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationModalContent } from './DelegationModalContent';

export interface DelegationModalProps {
  toParty: Party;
}

export const DelegationModal = ({ toParty }: DelegationModalProps) => {
  return (
    <DelegationModalProvider>
      <DelegationModalContent toParty={toParty} />
    </DelegationModalProvider>
  );
};
