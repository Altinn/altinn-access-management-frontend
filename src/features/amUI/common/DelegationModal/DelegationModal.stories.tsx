import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { RootProvider, Snackbar } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { DelegationModal, DelegationType } from './DelegationModal';
import { DelegationModalProvider } from './DelegationModalContext';

type DelegationModalProps = React.ComponentProps<typeof DelegationModal>;

export default {
  title: 'Features/AMUI/DelegationModal',
  component: DelegationModal,
  argTypes: {
    delegationType: {
      options: [DelegationType.SingleRights, DelegationType.AccessPackage],
      control: { type: 'inline-radio' },
    },
  },
  render: (props) => (
    <RootProvider>
      <DelegationModalProvider>
        <Provider store={store}>
          <PartyRepresentationProvider
            fromPartyUuid='123'
            toPartyUuid='123'
            actingPartyUuid='123'
          >
            <DelegationModal {...(props as DelegationModalProps)} />
          </PartyRepresentationProvider>
        </Provider>
      </DelegationModalProvider>
      <Snackbar />
    </RootProvider>
  ),
} as Meta;

export const Default: StoryObj<DelegationModalProps> = {
  args: {
    delegationType: DelegationType.SingleRights,
  },
};
