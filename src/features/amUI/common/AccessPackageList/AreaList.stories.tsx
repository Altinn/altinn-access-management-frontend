import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { AreaList } from './AccessPackageList';

type AreaListPropsAndCustomArgs = React.ComponentProps<typeof AreaList>;

export default {
  title: 'Features/AMUI/AreaList',
  component: AreaList,
  render: (args) => (
    <Provider store={store}>
      <AreaList
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
