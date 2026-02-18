import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { RootProvider } from '@altinn/altinn-components';

import store from '@/rtk/app/store';

import { PartyRepresentationProvider } from '../PartyRepresentationContext/PartyRepresentationContext';

import { DeleteUserModalContent } from './DeleteUserModalContent';
import {
  AGENT_ROLE_REASON,
  DeletionLevel,
  DeletionTarget,
  ER_ROLE_REASON,
  OLD_ALTINN_REASON,
  type DeletionStatus,
  type NonDeletableReason,
} from './deletionModalUtils';

type DeleteUserModalStoryArgs = {
  target: DeletionTarget;
  level: DeletionLevel;
  nonDeletableReasons: NonDeletableReason[];
  isRolePermissionsLoading: boolean;
};

const allReasons: NonDeletableReason[] = [OLD_ALTINN_REASON, ER_ROLE_REASON, AGENT_ROLE_REASON];

export default {
  title: 'Features/AMUI/DeleteUserModal',
  component: DeleteUserModalContent,
  args: {
    target: DeletionTarget.User,
    level: DeletionLevel.Full,
    nonDeletableReasons: [],
    isRolePermissionsLoading: false,
  },
  argTypes: {
    target: {
      control: { type: 'radio' },
      options: Object.values(DeletionTarget),
    },
    level: {
      control: { type: 'radio' },
      options: Object.values(DeletionLevel),
    },
    nonDeletableReasons: {
      control: { type: 'check' },
      options: allReasons,
    },
    isRolePermissionsLoading: {
      control: 'boolean',
    },
  },
  render: (args) => {
    const status: DeletionStatus = {
      target: args.target,
      level: args.level,
    };

    return (
      <Provider store={store}>
        <RootProvider>
          <PartyRepresentationProvider
            fromPartyUuid='123'
            toPartyUuid='456'
            actingPartyUuid='123'
          >
            <DeleteUserModalContent
              status={status}
              nonDeletableReasons={args.nonDeletableReasons}
              isRolePermissionsLoading={args.isRolePermissionsLoading}
            />
          </PartyRepresentationProvider>
        </RootProvider>
      </Provider>
    );
  },
} as Meta;

export const Default: StoryObj<DeleteUserModalStoryArgs> = {
  args: {
    target: DeletionTarget.User,
    level: DeletionLevel.Full,
    nonDeletableReasons: [],
    isRolePermissionsLoading: false,
  },
};
