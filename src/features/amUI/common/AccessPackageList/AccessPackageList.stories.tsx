import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { AccessPackageList } from './AccessPackageList';

type AreaListPropsAndCustomArgs = React.ComponentProps<typeof AccessPackageList>;

export default {
  title: 'Features/AMUI/AreaList',
  component: AccessPackageList,
  render: (args) => (
    <Provider store={store}>
      <AccessPackageList
        fromPartyUuid={''}
        toPartyUuid={''}
        {...args}
      />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<AreaListPropsAndCustomArgs> = {
  args: {
    fromPartyUuid: '123',
    toPartyUuid: '456',
  },
};
