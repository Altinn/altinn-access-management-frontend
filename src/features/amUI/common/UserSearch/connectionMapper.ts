import type { Connection } from '@/rtk/features/connectionApi';

import { buildSortKey, normalizeType } from './mapperUtils';
import type { UserSearchNode } from './types';
import { ExtendedUser, User } from '@/rtk/features/userInfoApi';

const mapUserToUserSearchNode = (user: ExtendedUser | User): UserSearchNode => ({
  id: user.id,
  name: user.name,
  type: normalizeType(user.type),
  variant: user.variant,
  partyId: user.partyId,
  organizationIdentifier: user.organizationIdentifier,
  dateOfBirth: user.dateOfBirth,
  isDeleted: user.isDeleted ?? undefined,
  sortKey: buildSortKey(user.name, user.sortKey, user.addedAt),
  addedAt: user.addedAt,
  isInherited: 'isInherited' in user ? user.isInherited : undefined,
  matchInChildren: 'matchInChildren' in user ? user.matchInChildren : undefined,
  roles: 'roles' in user && Array.isArray(user.roles) ? user.roles : [],
  children: user.children?.map(mapUserToUserSearchNode) ?? null,
});

export const mapConnectionsToUserSearchNodes = (connections?: Connection[]): UserSearchNode[] =>
  connections?.map((connection) => ({
    ...mapUserToUserSearchNode(connection.party),
    sortKey: buildSortKey(
      connection.party.name,
      connection.sortKey ?? connection.party.sortKey,
      connection.party.addedAt,
    ),
    roles: connection.roles,
    children: connection.connections?.length
      ? mapConnectionsToUserSearchNodes(connection.connections)
      : (connection.party.children?.map(mapUserToUserSearchNode) ?? null),
  })) ?? [];
