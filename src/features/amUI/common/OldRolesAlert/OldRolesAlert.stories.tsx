import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { OldRolesAlert } from './OldRolesAlert';

export default {
  title: 'Features/AMUI/OldRolesAlert',
  component: OldRolesAlert,
  render: (args) => (
    <Provider store={store}>
      <PartyRepresentationProvider
        fromPartyUuid={'123'}
        toPartyUuid={'456'}
        actingPartyUuid={'456'}
      >
        <OldRolesAlert {...args} />
      </PartyRepresentationProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
};
