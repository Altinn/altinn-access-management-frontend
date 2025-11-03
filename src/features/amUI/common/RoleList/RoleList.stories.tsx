import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider, Snackbar } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { RoleList } from './RoleList';

type RoleListPropsAndCustomArgs = React.ComponentProps<typeof RoleList>;

export default {
  title: 'Features/AMUI/RoleList',
  component: RoleList,
  render: (args) => (
    <Provider store={store}>
      <RootProvider>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='456'
          actingPartyUuid='123'
        >
          <RoleList
            {...args}
            onActionError={(role, error) => console.log('onActionError', role, error)}
            onSelect={(role) => console.log('onSelect', role)}
          />
        </PartyRepresentationProvider>
        <Snackbar />
      </RootProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<RoleListPropsAndCustomArgs> = {
  args: {},
};
