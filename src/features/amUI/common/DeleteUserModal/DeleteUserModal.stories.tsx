import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { DeleteUserModal } from './DeleteUserModal';

type DeleteUserModalStoryProps = React.ComponentProps<typeof DeleteUserModal>;

// Helper to wrap each story with necessary providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Provider store={store}>
    <RootProvider>{children}</RootProvider>
  </Provider>
);

export default {
  title: 'Features/AMUI/DeleteUserModal',
  component: DeleteUserModal,
} as Meta<DeleteUserModalStoryProps>;

// --- Stories for "Other User" (direction='to') ---
export const User_FullDeletionAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'DELETABLE_PARTY_1'}
        actingPartyUuid={'DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const User_LimitedDeletionOnly: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
        actingPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const User_DeletionNotAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'NOT_DELETABLE_PARTY_1'}
        actingPartyUuid={'NOT_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

// --- Stories for "Yourself" (direction='to') ---
export const Yourself_FullDeletionAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'DELETABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const Yourself_LimitedDeletionOnly: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const Yourself_DeletionNotAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'NOT_DELETABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'NOT_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal {...args} />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

// --- Stories for "Reportee" (Accesses at others, direction='from') ---
export const Reportee_FullDeletionAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'DELETABLE_PARTY_1'}
        actingPartyUuid={'DELETABLE_PARTY_1'}
      >
        <DeleteUserModal
          {...args}
          direction='from'
        />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const Reportee_LimitedDeletionOnly: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
        actingPartyUuid={'PARTIALLY_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal
          {...args}
          direction='from'
        />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};

export const Reportee_DeletionNotAllowed: StoryObj<DeleteUserModalStoryProps> = {
  render: (args) => (
    <StoryWrapper>
      <PartyRepresentationProvider
        fromPartyUuid={'PARTY_1'}
        toPartyUuid={'NOT_DELETABLE_PARTY_1'}
        actingPartyUuid={'NOT_DELETABLE_PARTY_1'}
      >
        <DeleteUserModal
          {...args}
          direction='from'
        />
      </PartyRepresentationProvider>
    </StoryWrapper>
  ),
  args: {},
};
