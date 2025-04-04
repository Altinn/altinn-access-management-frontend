import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { RoleList } from './RoleList';
import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';
import { SnackbarProvider } from '../Snackbar/SnackbarProvider';

type RoleListPropsAndCustomArgs = React.ComponentProps<typeof RoleList>;

export default {
  title: 'Features/AMUI/RoleList',
  component: RoleList,
  render: (args) => (
    <Provider store={store}>
      <SnackbarProvider>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='456'
        >
          <RoleList
            {...args}
            onActionError={(error) => console.log(`onActionError`, error)}
            onSelect={(id) => console.log(`onselect: ${id}`)}
          />
        </PartyRepresentationProvider>
      </SnackbarProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<RoleListPropsAndCustomArgs> = {
  args: {},
};
