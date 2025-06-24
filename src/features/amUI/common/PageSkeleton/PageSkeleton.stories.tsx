import type { Meta, StoryObj } from '@storybook/react';

import { PageSkeleton } from './PageSkeleton';

export default {
  title: 'Features/AMUI/PageSkeleton',
  component: PageSkeleton,
  render: (args) => (
    <PageSkeleton
      template={'listPage'}
      {...args}
    />
  ),
} as Meta;

export const Default: StoryObj<typeof PageSkeleton> = {
  args: {},
};

export const ListPage: StoryObj<typeof PageSkeleton> = {
  render: () => <PageSkeleton template={'listPage'} />,
};

export const DetailsPage: StoryObj<typeof PageSkeleton> = {
  render: () => <PageSkeleton template={'detailsPage'} />,
};
