import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { RootProvider, Snackbar } from '@altinn/altinn-components';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { AccessPackageList } from './AccessPackageList';

import store from '@/rtk/app/store';

type AreaListPropsAndCustomArgs = React.ComponentProps<typeof AccessPackageList>;

export default {
  title: 'Features/AMUI/AreaList',
  component: AccessPackageList,
  render: (args) => (
    <Provider store={store}>
      <RootProvider>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='456'
        >
          <AccessPackageList {...args} />
        </PartyRepresentationProvider>
        <Snackbar />
      </RootProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<AreaListPropsAndCustomArgs> = {
  args: {},
};
