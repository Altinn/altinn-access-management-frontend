import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { ResourceCollectionBar } from './ResourceCollectionBar';

type ResourceCollectionBarPropsAndCustomArgs = React.ComponentProps<typeof ResourceCollectionBar>;

export default {
  title: 'Features/SingleRight/ResourceCollectionBar',
  component: ResourceCollectionBar,
  render: (args) => (
    <ResourceCollectionBar {...(args as ResourceCollectionBarPropsAndCustomArgs)} />
  ),
} as Meta;

export const Default: StoryObj = {
  args: {
    compact: false,
    proceedToPath: '',
    resources: [
      { title: 'Resource 1', resourceOwnerName: 'Owner 1', identifier: 'appid-101' },
      { title: 'Resource 2', resourceOwnerName: 'Owner 2', identifier: 'appid-202' },
      { title: 'Resource 3', resourceOwnerName: 'Owner 3', identifier: 'appid-303' },
    ],
    onRemove: () => console.log('onRemove'),
  },
  argTypes: {
    proceedToPath: { control: { disabled: true } },
    onRemove: { control: { disabled: true } },
  },
};
