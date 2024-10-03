import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './Avatar';

type AvatarProps = React.ComponentProps<typeof Avatar>;

export default {
  title: 'Features/AMUI/AvatarS',
  component: Avatar,
  argTypes: {
    size: {
      options: ['lg', 'md', 'sm'],
      control: { type: 'inline-radio' },
    },
    profile: {
      options: ['organization', 'person', 'serviceOwner'],
      control: { type: 'inline-radio' },
    },
    icon: {
      control: { disable: true },
    },
  },
  render: (args) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        gap: '1rem',
      }}
    >
      <Avatar {...(args as AvatarProps)} />
    </div>
  ),
} as Meta;

export const Default: StoryObj<AvatarProps> = {
  args: {
    size: 'md',
    name: 'John Doe',
    profile: 'person',
  },
};
