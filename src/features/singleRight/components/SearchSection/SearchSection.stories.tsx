import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import React from 'react';

import store from '@/rtk/app/store';

import { SearchSection } from './SearchSection';

type SearchSectionPropsAndCustomArgs = React.ComponentProps<typeof SearchSection>;

export default {
  title: 'Features/SingleRight/SearchSection',
  component: SearchSection,
  render: (args) => (
    <Provider store={store}>
      <SearchSection {...(args as SearchSectionPropsAndCustomArgs)} />,
    </Provider>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {
    onAdd: () => console.log('onAdd'),
    onUndo: () => console.log('onUndo'),
  },
  argTypes: {
    onAdd: { control: { disabled: true } },
    onUndo: { control: { disabled: true } },
  },
};
