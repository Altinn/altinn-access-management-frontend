import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RootProvider } from '@altinn/altinn-components';

import { AdvancedUserSearch } from './AdvancedUserSearch';
import { Provider } from 'react-redux';
import store from '@/rtk/app/store';
import { Connection } from '@/rtk/features/connectionApi';

const mockAllConnections: Connection[] = [
  {
    party: {
      id: 'u1',
      name: 'Ola Nordmann',
      type: 'Person',
      variant: 'person',
      children: null,
      dateOfBirth: '1990-04-15',
      roles: [],
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
      dateOfBirth: '1985-11-30',
      roles: [],
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
      dateOfBirth: '2000-01-20',
      roles: [],
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
      dateOfBirth: '1975-07-07',
      roles: [],
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
      dateOfBirth: '2010-12-12',
      roles: [],
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
      dateOfBirth: '1990-04-15',
      roles: [],
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
      dateOfBirth: '1985-11-30',
      roles: [],
    },
    roles: [],
    connections: [],
  },
];

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
    onDelegate: () => undefined,
    onRevoke: () => undefined,
    isLoading: false,
    isActionLoading: false,
  },
};

export const EmptySearchShowsAdd: StoryObj<typeof meta> = {
  name: 'No match shows Add New',
  args: {
    connections: mockConnections,
    indirectConnections: mockAllConnections,
  },
};
