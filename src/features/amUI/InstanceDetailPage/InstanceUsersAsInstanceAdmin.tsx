import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import UserSearch from '../common/UserSearch/UserSearch';
import {
  mapSimplifiedConnectionsToUserSearchNodes,
  mapSimplifiedPartiesToUserSearchNodes,
} from '../common/UserSearch/connectionMapper';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { ConnectionUserType, useGetSimplifiedConnectionsQuery } from '@/rtk/features/connectionApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { useGetInstanceUsersQuery } from '@/rtk/features/instanceApi';
import type { UserActionTarget } from '../common/UserSearch/types';
import type { UserSearchProps } from '../common/UserSearch/UserSearch';

interface InstanceUsersAsInstanceAdminProps {
  resourceId: string;
  instanceUrn: string;
  AddUserButton: UserSearchProps['AddUserButton'];
  onDelegate: (user: UserActionTarget) => void;
}

export const InstanceUsersAsInstanceAdmin = ({
  resourceId,
  instanceUrn,
  AddUserButton,
  onDelegate,
}: InstanceUsersAsInstanceAdminProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const {
    data: instanceUsers,
    isLoading: isLoadingInstanceUsers,
    isError: isInstanceUsersError,
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
    isError: isConnectionError,
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
    () =>
      mapSimplifiedConnectionsToUserSearchNodes(simplifiedConnections).filter(
        (user) =>
          user.type !== ConnectionUserType.Organization ||
          (user.children && user.children.length > 0),
      ),
    [simplifiedConnections],
  );

  const errorDetails =
    isInstanceUsersError || isConnectionError
      ? createErrorDetails(instanceUsersError || connectionError)
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
        isLoading={isLoadingInstanceUsers || isLoadingSimplifiedConnections}
        isActionLoading={isFetchingSimplifiedConnections}
        canDelegate
        noUsersText={t('instance_detail_page.no_users')}
        searchPlaceholder={t('instance_detail_page.search_placeholder')}
        onDelegate={onDelegate}
      />
    </>
  );
};
