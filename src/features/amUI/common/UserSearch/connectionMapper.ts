import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { Connection, SimplifiedConnection } from '@/rtk/features/connectionApi';
import type { MaskinportenConnection } from '@/rtk/features/maskinportenApi';

import type { UserSearchNode } from './types';
import { mapPartyToUserSearchNode } from './mapperUtils';

export const mapConnectionsToUserSearchNodes = (connections?: Connection[]): UserSearchNode[] =>
  connections?.map((connection) => {
    const node = mapPartyToUserSearchNode(connection.party);
    return {
      ...node,
      roles: connection.roles,
      children: connection.connections?.length
        ? mapConnectionsToUserSearchNodes(connection.connections)
        : node.children,
    };
  }) ?? [];

export const mapSimplifiedConnectionsToUserSearchNodes = (
  connections?: SimplifiedConnection[],
): UserSearchNode[] =>
  connections?.map((connection) => ({
    ...mapPartyToUserSearchNode(connection.party),
    children: connection.connections?.length
      ? mapSimplifiedConnectionsToUserSearchNodes(connection.connections)
      : null,
  })) ?? [];

export const mapPartiesToUserSearchNodes = (parties?: PartyEntity[]): UserSearchNode[] =>
  parties?.map((party) => mapPartyToUserSearchNode(party)) ?? [];

export const mapMaskinportenConnectionsToUserSearchNodes = (
  connections?: MaskinportenConnection[],
): UserSearchNode[] =>
  connections?.map((connection) => ({
    ...mapPartyToUserSearchNode(connection.party),
    children: null,
    roles: connection.roles.map((role) => ({ id: role.id, code: role.code })),
  })) ?? [];
