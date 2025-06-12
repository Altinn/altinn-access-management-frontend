import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import { DeleteUserModal } from './DeleteUserModal';

type DeleteUserModalStoryProps = React.ComponentProps<typeof DeleteUserModal>;

// --- Constants for Story Setup ---
// These UUIDs are used to configure PartyRepresentationProvider for different scenarios.
// It's assumed that your mock API handlers for `useGetRightHoldersQuery` will use these
// to return specific `connections` data, leading to different deletion statuses.

// Represents the party whose roles determine deletability (used as `fromPartyUuid` in PartyRepresentationProvider)
const PARTY_WITH_FULL_DELETION_ROLES_UUID = '_'; // Leads to FullDeletionAllowed
const PARTY_WITH_LIMITED_DELETION_ROLES_UUID = 'mixed_roles'; // Leads to LimitedDeletionOnly
const PARTY_WITH_NO_DELETION_ROLES_UUID = 'admin_roles'; // Leads to DeletionNotAllowed

// Represents the "self" user in the context of the modal
const SELF_USER_UUID = '167536b5-f8ed-4c5a-8f48-0279507e53ae';

// Represents a generic "other" user being targeted by the deletion
const OTHER_USER_TARGET_UUID = 'other-user-456';

// Represents the user performing the action (acting party)
const ACTING_PARTY_UUID = 'acting-party-pompøs-tiger';

// For "Reportee" scenarios (direction='from')
const REPORTEE_PARTY_FULL_DELETION_UUID = '_123'; // Reportee that is fully deletable
// For limited and not allowed reportee scenarios, we can reuse the general role-based UUIDs
// if the mock handler can distinguish based on the from/to/acting party combination.
// Or, use distinct UUIDs if necessary, e.g., 'mixed_roles_reportee', 'admin_roles_reportee'.
// For this example, we'll reuse them for simplicity, assuming the context is sufficient.

// Helper to wrap each story with necessary providers
const StoryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
        toPartyUuid={'DELEATEABLE_PARTY_1'}
        actingPartyUuid={'DELEATEABLE_PARTY_1'}
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
        toPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
        actingPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
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
        toPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
        actingPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
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
        fromPartyUuid={'DELEATEABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'DELEATEABLE_PARTY_1'}
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
        fromPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
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
        fromPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
        toPartyUuid={'167536b5-f8ed-4c5a-8f48-0279507e53ae'} // Uuid of logged in party
        actingPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
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
        toPartyUuid={'DELEATEABLE_PARTY_1'}
        actingPartyUuid={'DELEATEABLE_PARTY_1'}
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
        toPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
        actingPartyUuid={'PARTIALLY_DELEATEABLE_PARTY_1'}
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
        toPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
        actingPartyUuid={'NOT_DELEATEABLE_PARTY_1'}
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
