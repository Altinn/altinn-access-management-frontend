import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import { PartyType } from '@/rtk/features/userInfoApi';
import store from '@/rtk/app/store';

import { SnackbarProvider } from '../Snackbar';

import { DelegationModal } from './DelegationModal';
import { DelegationType } from './DelegationModal';

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
      <Provider store={store}>
        <DelegationModal {...(props as DelegationModalProps)} />
      </Provider>
    </SnackbarProvider>
  ),
} as Meta;

export const Default: StoryObj<DelegationModalProps> = {
  args: {
    toParty: {
      partyId: 123,
      partyUuid: '123',
      orgNumber: '123123123',
      unitType: 'unitType',
      name: 'Ola Nordmann',
      partyTypeName: PartyType.Person,
    },
    delegationType: DelegationType.SingleRights,
  },
};
