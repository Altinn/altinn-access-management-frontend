import type { Meta, StoryObj } from '@storybook/react';
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
        fromPartyUuid={''}
        toPartyUuid={''}
      >
        <OldRolesAlert {...args} />
      </PartyRepresentationProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
};
