import type { Meta, StoryObj } from '@storybook/react';

import { BorderedList } from './BorderedList';
import { BorderedListItem } from './BorderedListItem/BorderedListItem';

type BorderedListPropsAndCustomArgs = React.ComponentProps<typeof BorderedList>;

const exampleArgs: BorderedListPropsAndCustomArgs = {
  borderStyle: 'solid',
};

export default {
  title: 'Components/BorderedList',
  component: BorderedList,
  argTypes: {
    borderStyle: {
      options: ['solid', 'dashed'],
      control: { type: 'radio' },
    },
  },
  render: (args) => (
    <BorderedList {...args}>
      <BorderedListItem {...args}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </BorderedListItem>
      <BorderedListItem {...args}>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </BorderedListItem>
      <BorderedListItem {...args}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur.
      </BorderedListItem>
      <BorderedListItem {...args}>
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
        anim id est laborum.
      </BorderedListItem>
    </BorderedList>
  ),
} as Meta;

export const Default: StoryObj<BorderedListPropsAndCustomArgs> = {
  args: exampleArgs,
};
