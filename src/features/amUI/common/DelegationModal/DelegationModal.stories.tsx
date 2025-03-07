import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { SnackbarProvider } from '../Snackbar';

import { DelegationModal, DelegationType } from './DelegationModal';

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
    toPartyUuid: '123',
    delegationType: DelegationType.SingleRights,
  },
};
