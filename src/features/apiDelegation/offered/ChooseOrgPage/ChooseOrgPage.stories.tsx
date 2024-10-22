import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { ChooseOrgPage } from './ChooseOrgPage';

export default {
  title: 'Features/Api delegation/ChooseOrgPage',
  component: ChooseOrgPage,
  render: (args) => (
    <Provider store={store}>
      <ChooseOrgPage {...args} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {};
