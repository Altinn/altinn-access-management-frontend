import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';

import { NewUserButton } from './NewUserModal';

import store from '@/rtk/app/store';

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
