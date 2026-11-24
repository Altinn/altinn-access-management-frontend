import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { RootProvider } from '@altinn/altinn-components';
import { Provider } from 'react-redux';

import { PartyType } from '@/dataObjects/dtos/Party';
import store from '@/rtk/app/store';
import { type Connection } from '@/rtk/features/connectionApi';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { UserSearch } from './UserSearch';
import { mapConnectionsToUserSearchNodes } from './connectionMapper';

const mockAllConnections: Connection[] = [
  {
    party: {
      id: 'u1',
      name: 'Ola Nordmann',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '1990-04-15',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u2',
      name: 'Kari Nordmann',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '1985-11-30',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u3',
      name: 'Nina Nordmann',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '2000-01-20',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u4',
      name: 'Ottar Sitrongul',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '1975-07-07',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u5',
      name: 'Nora Sitrongul',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '2010-12-12',
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
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '1990-04-15',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'u2',
      name: 'Kari Nordmann',
      type: PartyType.Person,
      isDeleted: false,
      children: null,
      dateOfBirth: '1985-11-30',
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'o1',
      name: 'UNG GYLDEN BJØRN KOMMUNE',
      type: PartyType.Organization,
      isDeleted: false,
      unitType: 'KOMM',
      organizationIdentifier: '311010905',
      children: [
        {
          id: 'o1-ados',
          name: 'VIS KONGE PANDA',
          type: PartyType.Organization,
          isDeleted: false,
          unitType: 'ADOS',
          organizationIdentifier: '313676781',
          children: null,
        },
      ],
    },
    roles: [],
    connections: [],
  },
  {
    party: {
      id: 'o2',
      name: 'RAKRYGGET UNG TIGER AS',
      type: PartyType.Organization,
      isDeleted: false,
      unitType: 'AS',
      organizationIdentifier: '313523497',
      children: null,
    },
    roles: [],
    connections: [
      {
        party: {
          id: 'u6',
          name: 'Intelligent Albatross',
          type: PartyType.Person,
          isDeleted: false,
          children: null,
          dateOfBirth: '1951-09-19',
        },
        roles: [],
        viaRoles: [
          { id: '123', code: 'daglig-leder' },
          { id: '9e5d3acf-cef7-4bbe-b101-8e9ab7b8b3e4', code: 'styreleder' },
        ],
        connections: [],
      },
    ],
  },
];

const meta = {
  title: 'Features/AMUI/UserSearch',
  component: UserSearch,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <RootProvider>
          <PartyRepresentationProvider
            fromPartyUuid='test-uuid'
            actingPartyUuid='test-uuid'
          >
            <div style={{ padding: 24, maxWidth: 800 }}>
              <Story />
            </div>
          </PartyRepresentationProvider>
        </RootProvider>
      </Provider>
    ),
  ],
} as Meta<typeof UserSearch>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    users: mapConnectionsToUserSearchNodes(mockConnections),
    indirectUsers: mapConnectionsToUserSearchNodes(mockAllConnections),
    onDelegate: () => undefined,
    onRevoke: () => undefined,
    isLoading: false,
    isActionLoading: false,
  },
};

export const EmptySearchShowsAdd: StoryObj<typeof meta> = {
  name: 'No match shows Add New',
  args: {
    users: mapConnectionsToUserSearchNodes(mockConnections),
    indirectUsers: mapConnectionsToUserSearchNodes(mockAllConnections),
  },
};
