import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { AccessPackageList } from './AccessPackageList';
import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

type AreaListPropsAndCustomArgs = React.ComponentProps<typeof AccessPackageList>;

export default {
  title: 'Features/AMUI/AreaList',
  component: AccessPackageList,
  render: (args) => (
    <Provider store={store}>
      <PartyRepresentationProvider
        fromPartyUuid='123'
        toPartyUuid='456'
      >
        <AccessPackageList {...args} />
      </PartyRepresentationProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<AreaListPropsAndCustomArgs> = {
  args: {},
};
