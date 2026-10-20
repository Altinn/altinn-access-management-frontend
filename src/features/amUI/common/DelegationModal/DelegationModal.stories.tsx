import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';
import { Provider } from 'react-redux';
import { RootProvider, Snackbar } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { DelegationModalProvider } from './DelegationModalContext';
import { DelegationAction } from './EditModal';
import { SingleRightsDelegationModal } from './SingleRights/SingleRightsDelegationModal';
import { AccessPackageDelegationModal } from './AccessPackages/AccessPackageDelegationModal';

const Providers = ({ children }: { children: JSX.Element }) => (
  <RootProvider>
    <DelegationModalProvider>
      <Provider store={store}>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='123'
          actingPartyUuid='123'
        >
          {children}
        </PartyRepresentationProvider>
      </Provider>
    </DelegationModalProvider>
    <Snackbar />
  </RootProvider>
);

export default {
  title: 'Features/AMUI/DelegationModal',
} as Meta;

export const SingleRights: StoryObj = {
  render: () => (
    <Providers>
      <SingleRightsDelegationModal availableActions={[DelegationAction.DELEGATE]} />
    </Providers>
  ),
};

export const AccessPackage: StoryObj = {
  render: () => (
    <Providers>
      <AccessPackageDelegationModal availableActions={[DelegationAction.DELEGATE]} />
    </Providers>
  ),
};
