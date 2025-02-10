import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { NewUserButton } from './NewUserModal';

export default {
  title: 'Features/AMUI/NewUserModal',
  component: NewUserButton,
  render: () => (
    <Provider store={store}>
      <NewUserButton />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
};
