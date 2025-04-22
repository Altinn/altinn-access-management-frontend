import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { RoleList } from './RoleList';

import store from '@/rtk/app/store';

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
        >
          <RoleList
            {...args}
            onActionError={(error) => console.log(`onActionError`, error)}
            onSelect={(id) => console.log(`onselect: ${id}`)}
          />
        </PartyRepresentationProvider>
      </RootProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<RoleListPropsAndCustomArgs> = {
  args: {},
};
