import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { SnackbarProvider } from '../Snackbar';

import { DelegationModal, DelegationType } from './DelegationModal';
import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';
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
    <SnackbarProvider>
      <DelegationModalProvider>
        <Provider store={store}>
          <PartyRepresentationProvider
            fromPartyUuid='123'
            toPartyUuid='123'
          >
              <DelegationModal {...(props as DelegationModalProps)} />
          </PartyRepresentationProvider>
        </Provider>
      </DelegationModalProvider>
    </SnackbarProvider>
  ),
} as Meta;

export const Default: StoryObj<DelegationModalProps> = {
  args: {
    delegationType: DelegationType.SingleRights,
  },
};
