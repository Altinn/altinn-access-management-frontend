import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { ChooseServicePage } from './ChooseServicePage';

export default {
  title: 'Features/SingleRight/ChooseServicePage',
  component: ChooseServicePage,
  render: (args) => (
    <Provider store={store}>
      <ChooseServicePage {...args} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {};
