import type { SimplifiedConnection, SimplifiedParty } from '@/rtk/features/connectionApi';

import { buildSortKey, normalizeType } from './mapperUtils';
import type { UserSearchNode } from './types';

/**
 * Maps a SimplifiedParty (from the limited instance users endpoint) to a UserSearchNode.
 * Used when the caller has instance-admin access but not full admin access, so only basic party info is available.
 */
const mapSimplifiedPartyToUserSearchNode = (
  party: SimplifiedParty,
  isInherited = false,
): UserSearchNode => ({
  id: party.id,
  name: party.name,
  type: normalizeType(party.type),
  variant: party.variant,
  organizationIdentifier: party.organizationIdentifier,
  isDeleted: party.isDeleted ?? undefined,
  sortKey: buildSortKey(party.name),
  roles: [],
  children: null,
  isInherited,
});

/**
 * Maps SimplifiedParty[] (from GET connections/resources/instances/users) to UserSearchNode[].
 * These are users who have access to a specific instance.
 * Used when the caller is instance admin without full admin access.
 */
export const mapSimplifiedPartiesToUserSearchNodes = (
  parties?: SimplifiedParty[],
): UserSearchNode[] => {
  if (!parties?.length) {
    return [];
  }

  return parties.map((party) => mapSimplifiedPartyToUserSearchNode(party));
};

/**
 * Maps SimplifiedConnection[] (from GET connections/users) to UserSearchNode[].
 * These are available indirect users for instance delegation.
 * Used when the caller is instance admin without full admin access.
 */
export const mapSimplifiedConnectionsToUserSearchNodes = (
  connections?: SimplifiedConnection[],
  inherited = false,
): UserSearchNode[] => {
  if (!connections?.length) {
    return [];
  }

  return connections.map((connection) => ({
    ...mapSimplifiedPartyToUserSearchNode(connection.party, inherited),
    children: connection.connections?.length
      ? mapSimplifiedConnectionsToUserSearchNodes(connection.connections, true)
      : null,
  }));
};
