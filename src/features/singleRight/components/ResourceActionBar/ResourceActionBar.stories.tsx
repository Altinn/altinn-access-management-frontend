import type { Meta, StoryObj } from '@storybook/react';

import { ResourceActionBar } from './ResourceActionBar';

type ResourceActionBarPropsAndCustomArgs = React.ComponentProps<typeof ResourceActionBar>;

export default {
  title: 'Features/SingleRight/ResourceActionBar',
  component: ResourceActionBar,
  render: (args) => <ResourceActionBar {...(args as ResourceActionBarPropsAndCustomArgs)} />,
} as Meta;

export const Default: StoryObj = {
  args: {
    compact: false,
    isLoading: false,
    subtitle: 'subtitle',
    title: 'title',
    children: 'children',
    status: 'status',
    errorText: 'errorText',
    onAddClick: () => console.log('onAddClick'),
    onRemoveClick: () => console.log('onRemoveClick'),
  },
  argTypes: {
    compact: { control: { type: 'boolean' } },
    isLoading: { control: { type: 'boolean' } },
    subtitle: { control: { type: 'text' } },
    title: { control: { type: 'text' } },
    children: { control: { type: 'text' } },
    status: { control: { type: 'text' } },
    errorText: { control: { type: 'text' } },
  },
};

export const Error: StoryObj = {
  args: {
    compact: false,
    isLoading: false,
    subtitle: 'subtitle',
    title: 'title',
    children: 'children',
    status: 'status',
    errorText: 'errorText',
    onAddClick: () => console.log('onAddClick'),
    onRemoveClick: () => console.log('onRemoveClick'),
  },
  argTypes: {
    compact: { control: { type: 'boolean' } },
    isLoading: { control: { type: 'boolean' } },
    subtitle: { control: { type: 'text' } },
    title: { control: { type: 'text' } },
    children: { control: { type: 'text' } },
    status: { control: { type: 'text' } },
    errorText: { control: { type: 'text' } },
  },
};
