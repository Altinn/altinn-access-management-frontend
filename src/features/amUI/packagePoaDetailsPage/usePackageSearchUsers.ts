import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { Permissions } from '@/dataObjects/dtos/accessPackage';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  isInheritedPermission,
  mapPermissionsToUserSearchNodes,
} from '../common/UserSearch/mappers';
import type { UserSearchNode } from '../common/UserSearch/types';

export const isInherited = (p: Permissions, toPartyUuid: string, fromPartyUuid: string) => {
  return isInheritedPermission(p, toPartyUuid, fromPartyUuid);
};

/*
  Maps package permissions to the normalized node shape used by UserSearch.
  The mapper preserves inherited status, role aggregation, and parent/child hierarchy.
*/

export const usePackageSearchUsers = (accessPackage?: AccessPackage): UserSearchNode[] => {
  const { toParty, fromParty } = usePartyRepresentation();
  return useMemo(
    () =>
      mapPermissionsToUserSearchNodes(accessPackage?.permissions, {
        toPartyUuid: toParty?.partyUuid,
        fromPartyUuid: fromParty?.partyUuid,
      }),
    [accessPackage?.permissions, toParty?.partyUuid, fromParty?.partyUuid],
  );
};
export default usePackageSearchUsers;
