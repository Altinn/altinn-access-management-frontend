import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { DelegationModal, DelegationType } from './DelegationModal';
import { DelegationModalProvider } from './DelegationModalContext';

import store from '@/rtk/app/store';

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
  ),
} as Meta;

export const Default: StoryObj<DelegationModalProps> = {
  args: {
    delegationType: DelegationType.SingleRights,
  },
};
