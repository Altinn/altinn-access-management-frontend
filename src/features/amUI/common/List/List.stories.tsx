import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from '@digdir/designsystemet-react';

import { List } from './List';
import { ListItem } from './ListItem';

type ListPropsAndCustomArgs = React.ComponentProps<typeof List>;
const exampleListArgs = {
  heading: (
    <Heading
      level={1}
      size='md'
    >
      {' '}
      List heading{' '}
    </Heading>
  ),
  spacing: true,
  background: true,
};

export default {
  title: 'Features/AMUI/List',
  component: List,
  argTypes: {
    borderStyle: {
      options: ['solid', 'dashed'],
      control: { type: 'radio' },
    },
  },
  render: (args) => (
    <List {...args}>
      <ListItem {...args}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </ListItem>
      <ListItem {...args}>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </ListItem>
      <ListItem {...args}>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur.
      </ListItem>
      <ListItem {...args}>
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
        anim id est laborum.
      </ListItem>
    </List>
  ),
} as Meta;

export const Default: StoryObj<ListPropsAndCustomArgs> = {
  args: exampleListArgs,
};
