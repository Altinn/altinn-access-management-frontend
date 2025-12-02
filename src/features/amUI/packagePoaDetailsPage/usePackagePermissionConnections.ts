import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { ExtendedUser } from '@/rtk/features/userInfoApi';
import { Entity } from '@/dataObjects/dtos/Common';
import { Connection } from '@/rtk/features/connectionApi';
import { Permissions } from '@/dataObjects/dtos/accessPackage';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const isInherited = (p: Permissions, toPartyUuid: string, fromPartyUuid: string) => {
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

/* 
This hook maps the permissions in an AccessPackage to a tree structure of Connections.
  Each Connection represents a user (party) and their roles, along with any nested connections.
  It handles both direct and inherited permissions, ensuring that roles are aggregated correctly.
  It also marks parties as inherited based on the isInherited function.
  
  If a user has arredy been added as a root connection and appears again in the permissions, 
  we add it afgain as a child connection to enable proper display of inherited status.

  
*/

export const usePackagePermissionConnections = (accessPackage?: AccessPackage): Connection[] => {
  const { toParty, fromParty } = usePartyRepresentation();
  return useMemo(() => {
    const permissions = accessPackage?.permissions;
    if (!permissions?.length) return [];

    const sortedPermissions = permissions?.toSorted((a: Permissions, b: Permissions) => {
      if ((a.via || a.viaRole) && !(b.via || b.viaRole)) return -1;
      if ((b.via || b.viaRole) && !(a.via || a.viaRole)) return 1;
      return 1;
    });

    const group: Record<string, Connection> = {};

    const ensureRoot = (e: Entity, isInheritedPermission: boolean): Connection => {
      if (!group[e.id]) {
        const party: ExtendedUser = {
          id: e.id,
          name: e.name,
          type: e.type,
          variant: e.variant,
          organizationIdentifier: e.organizationIdentifier,
          partyId: e.partyId,
          dateOfBirth: e.dateOfBirth,
          children: null,
          isInherited: isInheritedPermission,
          roles: [],
        };
        group[e.id] = { party, roles: [], connections: [] };
      } else {
        group[e.id] = {
          ...group[e.id],
          party: {
            ...group[e.id].party,
            isInherited: group[e.id].party.isInherited || isInheritedPermission,
          },
        };
      }
      return group[e.id];
    };

    const ensureChild = (
      parent: Connection,
      e: Entity,
      isInheritedPermission: boolean,
    ): Connection => {
      let node = parent.connections.find((c) => c.party.id === e.id);
      if (!node) {
        node = {
          party: {
            id: e.id,
            name: e.name,
            type: e.type,
            variant: e.variant,
            organizationIdentifier: e.organizationIdentifier,
            partyId: e.partyId,
            dateOfBirth: e.dateOfBirth,
            children: null,
            roles: [],
            isInherited: isInheritedPermission,
          },
          roles: [],
          connections: [],
        };
        parent.connections.unshift(node);
        return node;
      } else {
        const newNode = {
          ...node,
          party: { ...node.party, isInherited: node.party.isInherited || isInheritedPermission },
        };
        parent.connections = parent.connections.map((c) => (c.party.id === e.id ? newNode : c));
        return newNode;
      }
    };

    const addRole = (conn: Connection, id: string, code: string, viaParty?: Entity) => {
      if (!conn.roles.some((r) => r.code === code)) {
        conn.roles.push(viaParty ? { id, code, viaParty } : { id, code });
      }
    };

    for (const { to, from, role, via, viaRole } of sortedPermissions) {
      const isInheritedPermission = isInherited(
        { to, from, via, role, viaRole },
        toParty?.partyUuid || '',
        fromParty?.partyUuid || '',
      );
      if (via) {
        const viaConn = ensureRoot(via, false);
        const child = ensureChild(viaConn, to, isInheritedPermission);
        if (viaRole) addRole(child, viaRole.id, viaRole.code, via);
      } else {
        const root = ensureRoot(to, isInheritedPermission);
        if (role) addRole(root, role.id, role.code);
        if (root.connections.length > 0) {
          const child = ensureChild(root, to, isInheritedPermission);
          if (role) addRole(child, role.id, role.code);
        }
      }
    }
    return Object.values(group);
  }, [accessPackage?.permissions]);
};
export default usePackagePermissionConnections;
