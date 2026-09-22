import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';
import type { UserActionTarget } from '../common/UserSearch/types';
import { InstanceUserSearch } from './InstanceUserSearch';

interface InstanceUsersAsAdminProps {
  resourceId: string;
  instanceUrn: string;
  onSelect: (user: UserActionTarget) => void;
  onDelegate: (user: UserActionTarget) => void;
  onRevoke: (user: UserActionTarget) => void;
  isRevoking: boolean;
  restoreFocusFallbackId?: string;
}

/**
 * Instance users as seen by an admin: the full delegations of the instance,
 * which the admin can inspect and revoke as well as delegate.
 */
export const InstanceUsersAsAdmin = ({
  resourceId,
  instanceUrn,
  onSelect,
  onDelegate,
  onRevoke,
  isRevoking,
  restoreFocusFallbackId,
}: InstanceUsersAsAdminProps) => {
  const { i18n } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const {
    data: instances = [],
    isLoading: isInstancesLoading,
    error: instancesError,
  } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      resource: resourceId,
      instance: instanceUrn,
      language: i18n.language,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const users = useMemo(() => {
    return mapPermissionsToUserSearchNodes(
      instances.flatMap((instanceDelegation) => instanceDelegation.permissions),
      {
        fromPartyUuid: fromParty?.partyUuid,
      },
    );
  }, [fromParty?.partyUuid, instances]);

  const {
    data: indirectConnections,
    isLoading: isLoadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
    error: indirectError,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '',
    },
    {
      skip: !fromParty?.partyUuid,
    },
  );

  const indirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  return (
    <InstanceUserSearch
      resourceId={resourceId}
      instanceUrn={instanceUrn}
      users={users}
      indirectUsers={indirectUsers}
      isLoading={isInstancesLoading || isLoadingIndirectConnections}
      isActionLoading={isFetchingIndirectConnections || isRevoking}
      error={instancesError || indirectError}
      onSelect={onSelect}
      onDelegate={onDelegate}
      onRevoke={onRevoke}
      restoreFocusFallbackId={restoreFocusFallbackId}
    />
  );
};
