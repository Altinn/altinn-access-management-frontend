import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';

import { useGetInstancesQuery, useGetInstanceUsersQuery } from '@/rtk/features/instanceApi';
import { PartyType } from '@/dataObjects/dtos/Party';
import {
  useGetRightHoldersQuery,
  useGetSimplifiedConnectionsQuery,
} from '@/rtk/features/connectionApi';

import UserSearch from '../common/UserSearch/UserSearch';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import {
  mapConnectionsToUserSearchNodes,
  mapPartiesToUserSearchNodes,
  mapSimplifiedConnectionsToUserSearchNodes,
} from '../common/UserSearch/connectionMapper';
import {
  createErrorDetails,
  TechnicalErrorParagraphs,
} from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import type { UserActionTarget } from '../common/UserSearch/types';

import { AddUserButton } from './AddUserModal';

interface InstanceUsersProps {
  resourceId: string;
  instanceUrn: string;
  /** Full admins get detailed permissions and can edit/revoke; instance admins only get the
   *  limited (simplified) endpoints and can only delegate. */
  isAdmin: boolean;
  onSelect: (user: UserActionTarget) => void;
  onDelegate: (user: UserActionTarget) => void;
  onRevoke: (user: UserActionTarget) => void;
  isRevoking: boolean;
  restoreFocusFallbackId?: string;
}

export const InstanceUsers = ({
  resourceId,
  instanceUrn,
  isAdmin,
  onSelect,
  onDelegate,
  onRevoke,
  isRevoking,
  restoreFocusFallbackId,
}: InstanceUsersProps) => {
  const { t, i18n } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const missingParams = !actingParty?.id || !resourceId || !instanceUrn;

  // Admin: full instance delegations with permissions
  const instancesQuery = useGetInstancesQuery(
    {
      party: actingParty?.id || '',
      from: fromParty?.id,
      resource: resourceId,
      instance: instanceUrn,
      language: i18n.language,
    },
    {
      skip: !isAdmin || missingParams || !fromParty?.id,
    },
  );

  // Instance admin: simplified list of users with access
  const instanceUsersQuery = useGetInstanceUsersQuery(
    {
      party: actingParty?.id || '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: isAdmin || missingParams,
    },
  );

  const rightHoldersQuery = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.id ?? '',
      fromUuid: fromParty?.id ?? '',
      toUuid: '',
    },
    {
      skip: !isAdmin || !fromParty?.id,
    },
  );

  const simplifiedConnectionsQuery = useGetSimplifiedConnectionsQuery(
    { partyUuid: fromParty?.id ?? '' },
    {
      skip: isAdmin || !fromParty?.id,
    },
  );

  const usersQuery = isAdmin ? instancesQuery : instanceUsersQuery;
  const indirectQuery = isAdmin ? rightHoldersQuery : simplifiedConnectionsQuery;

  const users = useMemo(() => {
    const nodes = isAdmin
      ? mapPermissionsToUserSearchNodes(
          (instancesQuery.data ?? []).flatMap(
            (instanceDelegation) => instanceDelegation.permissions,
          ),
          { fromPartyUuid: fromParty?.id },
        )
      : mapPartiesToUserSearchNodes(instanceUsersQuery.data);
    return nodes.filter((user) => user.type !== PartyType.SystemUser);
  }, [isAdmin, instancesQuery.data, instanceUsersQuery.data, fromParty?.id]);

  const indirectUsers = useMemo(() => {
    const nodes = isAdmin
      ? mapConnectionsToUserSearchNodes(rightHoldersQuery.data)
      : mapSimplifiedConnectionsToUserSearchNodes(simplifiedConnectionsQuery.data);
    return nodes.filter(
      (user) =>
        (user.type !== PartyType.Organization && user.type !== PartyType.SystemUser) ||
        (user.children && user.children.length > 0),
    );
  }, [isAdmin, rightHoldersQuery.data, simplifiedConnectionsQuery.data]);

  const errorDetails =
    usersQuery.isError || indirectQuery.isError
      ? createErrorDetails(usersQuery.error || indirectQuery.error)
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
        restoreFocusFallbackId={restoreFocusFallbackId}
        AddUserButton={
          <AddUserButton
            resourceId={resourceId}
            instanceUrn={instanceUrn}
          />
        }
        users={users}
        indirectUsers={indirectUsers}
        isLoading={usersQuery.isLoading || indirectQuery.isLoading}
        isActionLoading={indirectQuery.isFetching || isRevoking}
        canDelegate
        noUsersText={t('instance_detail_page.no_users')}
        directConnectionsHeading={t('instance_detail_page.direct_connections')}
        indirectConnectionsHeading={t('instance_detail_page.indirect_connections')}
        searchPlaceholder={t('instance_detail_page.search_placeholder')}
        onDelegate={onDelegate}
        onSelect={isAdmin ? onSelect : undefined}
        onRevoke={isAdmin ? onRevoke : undefined}
      />
    </>
  );
};
