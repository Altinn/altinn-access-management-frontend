import type { Meta, StoryObj } from '@storybook/react';

import { Avatar } from './Avatar';

type AvatarProps = React.ComponentProps<typeof Avatar>;

export default {
  title: 'Features/AMUI/Avatar',
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

export const ServiceOwner: StoryObj<AvatarProps> = {
  args: {
    size: 'md',
    profile: 'serviceOwner',
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <Avatar
        {...(args as AvatarProps)}
        logoUrl='https://altinncdn.no/orgs/dat/arbeidstilsynet.png'
        name='Arbeidstilsynet'
      />
      <div> Arbeidstilsynet</div>

      <Avatar
        {...(args as AvatarProps)}
        logoUrl='https://altinncdn.no/orgs/buf/buf.png'
        name='Barne-, ungdoms- og familiedirektoratet'
      />
      <div> Barne-, ungdoms- og familiedirektoratet</div>

      <Avatar
        {...(args as AvatarProps)}
        logoUrl='https://altinncdn.no/orgs/udir/udir.png'
        name='Udir'
      />
      <div> Udir</div>

      <Avatar
        {...(args as AvatarProps)}
        name='Udir'
      />
      <div>Udir (uten logo)</div>

      <Avatar {...(args as AvatarProps)} />
      <div>{`{Null}`}</div>
    </div>
  ),
};

export const Organization: StoryObj<AvatarProps> = {
  args: {
    size: 'md',
    name: 'OrgName',
    profile: 'organization',
  },
};
