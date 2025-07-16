import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';

import store from '@/rtk/app/store';

import { ReceiptPage } from './ReceiptPage';

export default {
  title: 'Features/SingleRight/ReceiptPage/ReceiptPage',
  component: ReceiptPage,
  render: (args) => (
    <Provider store={store}>
      <ReceiptPage {...args} />
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {};
