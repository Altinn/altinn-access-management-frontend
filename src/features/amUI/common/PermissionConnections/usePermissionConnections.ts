import { useMemo } from 'react';

import { Permissions } from '@/dataObjects/dtos/accessPackage';
import { Entity } from '@/dataObjects/dtos/Common';
import { Connection } from '@/rtk/features/connectionApi';
import { ExtendedUser } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

type ConnectionPermission = Pick<Permissions, 'to' | 'from' | 'role' | 'via' | 'viaRole'>;

export const isInheritedPermission = (
  p: ConnectionPermission,
  toPartyUuid: string,
  fromPartyUuid: string,
) => {
  if (toPartyUuid !== p.to.id && fromPartyUuid !== p.from.id) {
    return true;
  }
  if (p.role && p.role?.code !== 'rettighetshaver') {
    return true;
  }
  if (p.via || p.viaRole) {
    return true;
  }
  return false;
};

export const usePermissionConnections = (permissions?: Permissions[]): Connection[] => {
  const { toParty, fromParty } = usePartyRepresentation();

  return useMemo(() => {
    if (!permissions?.length) {
      return [];
    }

    const group: Record<string, Connection> = {};

    const ensureRoot = (entity: Entity, inherited: boolean): Connection => {
      if (!group[entity.id]) {
        const party: ExtendedUser = {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          variant: entity.variant,
          organizationIdentifier: entity.organizationIdentifier,
          partyId: entity.partyId,
          dateOfBirth: entity.dateOfBirth,
          children: null,
          isInherited: inherited,
          roles: [],
        };

        group[entity.id] = { party, roles: [], connections: [] };
      } else {
        group[entity.id] = {
          ...group[entity.id],
          party: {
            ...group[entity.id].party,
            isInherited: group[entity.id].party.isInherited || inherited,
          },
        };
      }

      return group[entity.id];
    };

    const ensureChild = (parent: Connection, entity: Entity, inherited: boolean): Connection => {
      let node = parent.connections.find((connection) => connection.party.id === entity.id);

      if (!node) {
        node = {
          party: {
            id: entity.id,
            name: entity.name,
            type: entity.type,
            variant: entity.variant,
            organizationIdentifier: entity.organizationIdentifier,
            partyId: entity.partyId,
            dateOfBirth: entity.dateOfBirth,
            children: null,
            roles: [],
            isInherited: inherited,
          },
          roles: [],
          connections: [],
        };
        parent.connections.unshift(node);
        return node;
      }

      const updatedNode = {
        ...node,
        party: { ...node.party, isInherited: node.party.isInherited || inherited },
      };
      parent.connections = parent.connections.map((connection) =>
        connection.party.id === entity.id ? updatedNode : connection,
      );
      return updatedNode;
    };

    const addRole = (connection: Connection, id: string, code: string, viaParty?: Entity) => {
      if (!connection.roles.some((role) => role.code === code)) {
        connection.roles.push(viaParty ? { id, code, viaParty } : { id, code });
      }
    };

    const sortedPermissions = permissions.toSorted((a, b) => {
      if ((a.via || a.viaRole) && !(b.via || b.viaRole)) {
        return -1;
      }
      if ((b.via || b.viaRole) && !(a.via || a.viaRole)) {
        return 1;
      }
      return 0;
    });

    for (const { to, from, role, via, viaRole } of sortedPermissions) {
      const inherited = isInheritedPermission(
        { to, from, role, via, viaRole },
        toParty?.partyUuid || '',
        fromParty?.partyUuid || '',
      );

      if (via) {
        const viaConnection = ensureRoot(via, false);
        const child = ensureChild(viaConnection, to, inherited);
        if (viaRole) {
          addRole(child, viaRole.id, viaRole.code, via);
        }
      } else {
        const root = ensureRoot(to, inherited);
        if (role) {
          addRole(root, role.id, role.code);
        }
        if (root.connections.length > 0) {
          const child = ensureChild(root, to, inherited);
          if (role) {
            addRole(child, role.id, role.code);
          }
        }
      }
    }

    return Object.values(group);
  }, [permissions, toParty?.partyUuid, fromParty?.partyUuid]);
};
