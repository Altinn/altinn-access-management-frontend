import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import UserSearch from '../common/UserSearch/UserSearch';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useGetInstancesQuery, useRemoveInstanceMutation } from '@/rtk/features/instanceApi';
import type { UserActionTarget } from '../common/UserSearch/types';
import type { UserSearchProps } from '../common/UserSearch/UserSearch';

interface InstanceUsersAsAdminProps {
  resourceId: string;
  instanceUrn: string;
  AddUserButton: UserSearchProps['AddUserButton'];
  onSelect: (user: UserActionTarget) => void;
  onDelegate: (user: UserActionTarget) => void;
  onRevoke: (user: UserActionTarget) => void;
  isRevoking: boolean;
}

export const InstanceUsersAsAdmin = ({
  resourceId,
  instanceUrn,
  AddUserButton,
  onSelect,
  onDelegate,
  onRevoke,
  isRevoking,
}: InstanceUsersAsAdminProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { data: instances = [], isLoading: isInstancesLoading } = useGetInstancesQuery(
    {
      party: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid,
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const users = useMemo(
    () =>
      mapPermissionsToUserSearchNodes(
        instances.flatMap((instanceDelegation) => instanceDelegation.permissions),
        {
          fromPartyUuid: fromParty?.partyUuid,
        },
      ),
    [fromParty?.partyUuid, instances],
  );

  const {
    data: indirectConnections,
    isLoading: isLoadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
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
    <UserSearch
      includeSelfAsChild={false}
      AddUserButton={AddUserButton}
      users={users}
      indirectUsers={indirectUsers}
      isLoading={isInstancesLoading || isLoadingIndirectConnections}
      isActionLoading={isFetchingIndirectConnections || isRevoking}
      canDelegate
      noUsersText={t('instance_detail_page.no_users')}
      onDelegate={onDelegate}
      onSelect={onSelect}
      onRevoke={onRevoke}
    />
  );
};
