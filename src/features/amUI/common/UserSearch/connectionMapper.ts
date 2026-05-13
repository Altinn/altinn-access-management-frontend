import type {
  Connection,
  SimplifiedConnection,
  SimplifiedParty,
} from '@/rtk/features/connectionApi';
import type { MaskinportenConnection } from '@/rtk/features/maskinportenApi';

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

const mapSimplifiedPartyToNode = (party: SimplifiedParty): UserSearchNode => ({
  id: party.id,
  name: party.name,
  type: normalizeType(party.type),
  variant: party.variant,
  organizationIdentifier: party.organizationIdentifier,
  isDeleted: party.isDeleted ?? undefined,
  sortKey: buildSortKey(party.name),
  roles: [],
  children: null,
});

export const mapSimplifiedConnectionsToUserSearchNodes = (
  connections?: SimplifiedConnection[],
): UserSearchNode[] =>
  connections?.map((connection) => ({
    ...mapSimplifiedPartyToNode(connection.party),
    children: connection.connections?.length
      ? mapSimplifiedConnectionsToUserSearchNodes(connection.connections)
      : null,
  })) ?? [];

export const mapSimplifiedPartiesToUserSearchNodes = (
  parties?: SimplifiedParty[],
): UserSearchNode[] => parties?.map(mapSimplifiedPartyToNode) ?? [];

export const mapMaskinportenConnectionsToUserSearchNodes = (
  connections?: MaskinportenConnection[],
): UserSearchNode[] =>
  connections?.map((connection) => ({
    id: connection.party.id,
    name: connection.party.name,
    type: normalizeType(connection.party.type),
    variant: connection.party.variant,
    organizationIdentifier: connection.party.organizationIdentifier ?? undefined,
    isDeleted: connection.party.isDeleted ?? undefined,
    sortKey: buildSortKey(connection.party.name),
    roles: connection.roles.map((role) => ({ id: role.id, code: role.code })),
    children: null,
  })) ?? [];
