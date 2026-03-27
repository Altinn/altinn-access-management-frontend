import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import UserSearch from '../common/UserSearch/UserSearch';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ConnectionUserType, useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetInstancesQuery } from '@/rtk/features/instanceApi';
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

  const {
    data: instances = [],
    isLoading: isInstancesLoading,
    isError: isInstancesError,
    error: instancesError,
  } = useGetInstancesQuery(
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
    isError: isIndirectError,
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
    () =>
      mapConnectionsToUserSearchNodes(indirectConnections).filter(
        (user) =>
          user.type !== ConnectionUserType.Organization ||
          (user.children && user.children.length > 0),
      ),
    [indirectConnections],
  );

  const errorDetails =
    isInstancesError || isIndirectError
      ? createErrorDetails(instancesError || indirectError)
      : null;

  return (
    <>
      {errorDetails && (
        <DsAlert
          role='alert'
          data-color='danger'
        >
          <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
          <TechnicalErrorParagraphs
            size='sm'
            status={errorDetails.status}
            time={errorDetails.time}
            traceId={errorDetails.traceId}
          />
        </DsAlert>
      )}
      <UserSearch
        includeSelfAsChild={false}
        includeSelfAsChildOnIndirect={false}
        AddUserButton={AddUserButton}
        users={users}
        indirectUsers={indirectUsers}
        isLoading={isInstancesLoading || isLoadingIndirectConnections}
        isActionLoading={isFetchingIndirectConnections || isRevoking}
        canDelegate
        noUsersText={t('instance_detail_page.no_users')}
        searchPlaceholder={t('instance_detail_page.search_placeholder')}
        onDelegate={onDelegate}
        onSelect={onSelect}
        onRevoke={onRevoke}
      />
    </>
  );
};
