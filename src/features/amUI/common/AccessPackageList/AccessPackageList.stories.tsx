import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { AccessPackageList } from './AccessPackageList';
import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';
import { SnackbarProvider } from '../Snackbar/SnackbarProvider';

type AreaListPropsAndCustomArgs = React.ComponentProps<typeof AccessPackageList>;

export default {
  title: 'Features/AMUI/AreaList',
  component: AccessPackageList,
  render: (args) => (
    <Provider store={store}>
      <SnackbarProvider>
        <PartyRepresentationProvider
          fromPartyUuid='123'
          toPartyUuid='456'
        >
          <AccessPackageList {...args} />
        </PartyRepresentationProvider>
      </SnackbarProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<AreaListPropsAndCustomArgs> = {
  args: {},
};
