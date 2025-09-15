import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { RootProvider } from '@altinn/altinn-components';

import { AdvancedUserSearch } from './AdvancedUserSearch';
import type { Connection, ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { Provider } from 'react-redux';
import store from '@/rtk/app/store';
import { ExtendedAccessPackage } from '../AccessPackageList/useAreaPackageList';
import { DelegationAction } from '../DelegationModal/EditModal';
// No PartyRepresentationProvider or Redux store to keep the story isolated

const mockAllConnections: Connection[] = [
  {
    party: {
      id: 'u1',
      name: 'Ola Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '1990-04-15' },
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u2',
      name: 'Kari Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '1985-11-30' },
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u3',
      name: 'Nina Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '2000-01-20' },
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u4',
      name: 'Ottar Sitrongul',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '1975-07-07' },
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u5',
      name: 'Nora Sitrongul',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '2010-12-12' },
    },
    roles: [],
    connections: [],
  },
];

const mockConnections: Connection[] = [
  {
    party: {
      id: 'u1',
      name: 'Ola Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '1990-04-15' },
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u2',
      name: 'Kari Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      keyValues: { DateOfBirth: '1985-11-30' },
    },
    roles: [],
    connections: [],
  },
];

const mockAccessPackage = {
  id: 'ap1',
  name: 'Test Access Package',
  description: 'This is a test access package',
  isAssignable: true,
} as ExtendedAccessPackage;

const meta = {
  title: 'Features/AMUI/AdvancedUserSearch',
  component: AdvancedUserSearch,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <RootProvider>
          <div style={{ padding: 24, maxWidth: 800 }}>
            <Story />
          </div>
        </RootProvider>
      </Provider>
    ),
  ],
} as Meta<typeof AdvancedUserSearch>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    connections: mockConnections,
    indirectConnections: mockAllConnections,
    accessPackage: mockAccessPackage,
    canDelegate: true,
  },
};

export const EmptySearchShowsAdd: StoryObj<typeof meta> = {
  name: 'No match shows Add New',
  args: {
    connections: mockConnections,
    indirectConnections: mockAllConnections,
  },
  render: (args: React.ComponentProps<typeof AdvancedUserSearch>) => (
    <Provider store={store}>
      <div style={{ padding: 24, maxWidth: 800 }}>
        <p style={{ marginBottom: 12 }}>Try typing: "NoSuchUser" to see the add new state.</p>
        <AdvancedUserSearch {...args} />
      </div>
    </Provider>
  ),
};
