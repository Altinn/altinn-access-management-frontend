import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { Permissions } from '@/dataObjects/dtos/accessPackage';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { mapPermissionsToUserSearchNodes } from '../common/UserSearch/mappers';
import type { UserSearchNode } from '../common/UserSearch/types';

export const isInherited = (p: Permissions, toPartyUuid: string, fromPartyUuid: string) => {
  if (toPartyUuid !== p.to.id && fromPartyUuid !== p.from.id) {
    return true;
  }

  if (p.role && p.role.code !== 'rettighetshaver') {
    return true;
  }

  if (p.via || p.viaRole) {
    return true;
  }

  return false;
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
