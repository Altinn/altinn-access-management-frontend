import { useMemo } from 'react';

import {
  mapSimplifiedConnectionsToUserSearchNodes,
  mapSimplifiedPartiesToUserSearchNodes,
} from '../common/UserSearch/connectionMapper';
import { useGetSimplifiedConnectionsQuery } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetInstanceUsersQuery } from '@/rtk/features/instanceApi';
import type { UserActionTarget } from '../common/UserSearch/types';
import { InstanceUserSearch } from './InstanceUserSearch';

interface InstanceUsersAsInstanceAdminProps {
  resourceId: string;
  instanceUrn: string;
  onDelegate: (user: UserActionTarget) => void;
  restoreFocusFallbackId?: string;
}

/**
 * Instance users as seen by an instance admin: only who has access, in simplified
 * form. No onSelect/onRevoke is passed, so existing delegations can't be inspected
 * or revoked from here - delegating is the only action available.
 */
export const InstanceUsersAsInstanceAdmin = ({
  resourceId,
  instanceUrn,
  onDelegate,
  restoreFocusFallbackId,
}: InstanceUsersAsInstanceAdminProps) => {
  const { actingParty, fromParty } = usePartyRepresentation();

  const {
    data: instanceUsers,
    isLoading: isLoadingInstanceUsers,
    error: instanceUsersError,
  } = useGetInstanceUsersQuery(
    {
      party: actingParty?.partyUuid || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !actingParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const {
    data: simplifiedConnections,
    isLoading: isLoadingSimplifiedConnections,
    isFetching: isFetchingSimplifiedConnections,
    error: connectionError,
  } = useGetSimplifiedConnectionsQuery(
    { partyUuid: fromParty?.partyUuid ?? '' },
    {
      skip: !fromParty?.partyUuid,
    },
  );

  const users = useMemo(
    () => mapSimplifiedPartiesToUserSearchNodes(instanceUsers),
    [instanceUsers],
  );

  const indirectUsers = useMemo(
    () => mapSimplifiedConnectionsToUserSearchNodes(simplifiedConnections),
    [simplifiedConnections],
  );

  return (
    <InstanceUserSearch
      resourceId={resourceId}
      instanceUrn={instanceUrn}
      users={users}
      indirectUsers={indirectUsers}
      isLoading={isLoadingInstanceUsers || isLoadingSimplifiedConnections}
      isActionLoading={isFetchingSimplifiedConnections}
      error={instanceUsersError || connectionError}
      onDelegate={onDelegate}
      restoreFocusFallbackId={restoreFocusFallbackId}
    />
  );
};
