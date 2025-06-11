import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { Heading, RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { DeleteUserModal } from './DeleteUserModal';

type RoleListPropsAndCustomArgs = React.ComponentProps<typeof DeleteUserModal>;

export default {
  title: 'Features/AMUI/DeleteUserModal',
  component: DeleteUserModal,
  render: (args) => (
    <Provider store={store}>
      <RootProvider>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Heading>Annen bruker</Heading>
            <PartyRepresentationProvider
              fromPartyUuid='_'
              toPartyUuid='456'
              actingPartyUuid='POMPØS_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='mixed_roles'
              toPartyUuid='456'
              actingPartyUuid='SMISKENDE_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Delvis slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='admin_roles'
              toPartyUuid='789'
              actingPartyUuid='789'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Ikke slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Heading>Deg selv</Heading>
            <PartyRepresentationProvider
              fromPartyUuid='_'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='POMPØS_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='mixed_roles'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='SMISKENDE_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Delvis slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='admin_roles'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='789'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Ikke slettbar</Heading>
                <DeleteUserModal {...args} />
              </div>
            </PartyRepresentationProvider>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Heading>Tilganger hos andre</Heading>
            <PartyRepresentationProvider
              fromPartyUuid='_123'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='POMPØS_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Slettbar</Heading>
                <DeleteUserModal
                  {...args}
                  direction='from'
                />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='mixed_roles'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='SMISKENDE_TIGER'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Delvis slettbar</Heading>
                <DeleteUserModal
                  {...args}
                  direction='from'
                />
              </div>
            </PartyRepresentationProvider>
            <PartyRepresentationProvider
              fromPartyUuid='admin_roles'
              toPartyUuid='167536b5-f8ed-4c5a-8f48-0279507e53ae'
              actingPartyUuid='789'
            >
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Ikke slettbar</Heading>
                <DeleteUserModal
                  {...args}
                  direction='from'
                />
              </div>
            </PartyRepresentationProvider>
          </div>
        </div>
      </RootProvider>
    </Provider>
  ),
} as Meta;

export const Default: StoryObj<RoleListPropsAndCustomArgs> = {
  args: {},
};
