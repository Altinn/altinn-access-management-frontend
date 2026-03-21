import { useMemo } from 'react';

import { useGetRightHoldersQuery, useGetAvailableUsersQuery } from '@/rtk/features/connectionApi';
import { useGetInstancesQuery, useGetInstanceUsersQuery } from '@/rtk/features/instanceApi';
import { useGetResourceQuery } from '@/rtk/features/resourceApi';
import { useGetIsAdminQuery, useGetIsInstanceAdminQuery } from '@/rtk/features/userInfoApi';
import { useProviderLogoUrl } from '@/resources/hooks';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { createErrorDetails } from '../common/TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/permissionMapper';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/connectionMapper';
import {
  mapSimplifiedPartiesToUserSearchNodes,
  mapSimplifiedConnectionsToUserSearchNodes,
} from '../common/UserSearch/simplifiedMapper';

export const useInstanceDetailData = ({
  resourceId,
  instanceUrn,
}: {
  resourceId: string;
  instanceUrn: string;
}) => {
  const { actingParty, fromParty } = usePartyRepresentation();
  const { getProviderLogoUrl } = useProviderLogoUrl();

  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    isError: isAdminError,
    error: isAdminErrorObj,
  } = useGetIsAdminQuery();

  const {
    data: isInstanceAdmin,
    isLoading: isInstanceAdminLoading,
    isError: isInstanceAdminError,
    error: isInstanceAdminErrorObj,
  } = useGetIsInstanceAdminQuery();

  const useLimitedEndpoints = !isAdmin && isInstanceAdmin;
  const shouldGetIndirectConnections = isAdmin && fromParty?.partyUuid;
  const shouldGetAvailableUsers = useLimitedEndpoints && fromParty?.partyUuid;

  // --- Full admin endpoints ---

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
      skip:
        !isAdmin || !actingParty?.partyUuid || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const adminUsers = useMemo(
    () =>
      mapPermissionsToUserSearchNodes(
        instances.flatMap((d) => d.permissions),
        { fromPartyUuid: fromParty?.partyUuid },
      ),
    [fromParty?.partyUuid, instances],
  );

  const {
    data: indirectConnections,
    isLoading: isLoadingIndirectConnections,
    isFetching: isFetchingIndirectConnections,
    isError: isIndirectConnectionsError,
    error: indirectConnectionsError,
  } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '',
    },
    {
      skip: !shouldGetIndirectConnections,
    },
  );

  const adminIndirectUsers = useMemo(
    () => mapConnectionsToUserSearchNodes(indirectConnections),
    [indirectConnections],
  );

  // --- Limited endpoints (instance admin only) ---

  const {
    data: instanceUsers,
    isLoading: isInstanceUsersLoading,
    isError: isInstanceUsersError,
    error: instanceUsersError,
  } = useGetInstanceUsersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      resource: resourceId,
      instance: instanceUrn,
    },
    {
      skip: !useLimitedEndpoints || !fromParty?.partyUuid || !resourceId || !instanceUrn,
    },
  );

  const clientAdminUsers = useMemo(
    () => mapSimplifiedPartiesToUserSearchNodes(instanceUsers),
    [instanceUsers],
  );

  const {
    data: availableUsers,
    isLoading: isAvailableUsersLoading,
    isFetching: isFetchingAvailableUsers,
    isError: isAvailableUsersError,
    error: availableUsersError,
  } = useGetAvailableUsersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
    },
    {
      skip: !shouldGetAvailableUsers,
    },
  );

  const clientAdminIndirectUsers = useMemo(
    () => mapSimplifiedConnectionsToUserSearchNodes(availableUsers),
    [availableUsers],
  );

  // --- Resource ---

  const {
    data: resource,
    isLoading: isResourceLoading,
    error: resourceError,
  } = useGetResourceQuery(resourceId, {
    skip: !resourceId,
  });

  const providerLogoUrl = resource?.resourceOwnerOrgcode
    ? getProviderLogoUrl(resource.resourceOwnerOrgcode)
    : undefined;

  // --- Resolved data ---

  const users = isAdmin ? adminUsers : clientAdminUsers;
  const indirectUsers = isAdmin ? adminIndirectUsers : clientAdminIndirectUsers;

  // --- Error handling ---

  const hasContentTechnicalError =
    isAdminError ||
    isInstanceAdminError ||
    isInstancesError ||
    (shouldGetIndirectConnections && isIndirectConnectionsError) ||
    isInstanceUsersError ||
    (shouldGetAvailableUsers && isAvailableUsersError) ||
    Boolean(resourceError);

  const contentTechnicalError = hasContentTechnicalError
    ? (createErrorDetails(
        instancesError ||
          (shouldGetIndirectConnections ? indirectConnectionsError : undefined) ||
          instanceUsersError ||
          (shouldGetAvailableUsers ? availableUsersError : undefined) ||
          isAdminErrorObj ||
          isInstanceAdminErrorObj ||
          resourceError,
      ) ?? {
        status: 'unknown',
        time: new Date().toISOString(),
      })
    : null;

  // --- Loading states ---

  const isInitialLoading = isResourceLoading || isAdminLoading || isInstanceAdminLoading;

  const isUsersLoading = isAdmin
    ? isInstancesLoading || isLoadingIndirectConnections || isInstanceAdminLoading
    : isInstanceUsersLoading || isAvailableUsersLoading;

  const isActionLoading = isAdmin ? isFetchingIndirectConnections : isFetchingAvailableUsers;

  return {
    resource,
    providerLogoUrl,
    fromParty,
    isAdmin,
    isInstanceAdmin,
    users,
    indirectUsers,
    isInitialLoading,
    isUsersLoading,
    isActionLoading,
    contentTechnicalError,
  };
};
