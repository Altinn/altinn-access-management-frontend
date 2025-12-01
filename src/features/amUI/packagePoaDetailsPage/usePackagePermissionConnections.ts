import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { ExtendedUser } from '@/rtk/features/userInfoApi';
import { Entity } from '@/dataObjects/dtos/Common';
import { Connection } from '@/rtk/features/connectionApi';
import { isInherited } from '../common/AccessPackageList/useAreaPackageList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

/**
 * Temporary transformation hook.
 *
 * Converts AccessPackage.permissions (flat list of permission relations) into the hierarchical
 * Connection[] structure expected by AdvancedUserSearch (mirroring the /rightholders endpoint result).
 * This will become unnecessary once (or if) the backend exposes permissions in the same structured
 * format as the connections endpoint. When that happens, replace usages of this hook with the direct
 * backend response and remove this file.
 */

export const usePackagePermissionConnections = (accessPackage?: AccessPackage): Connection[] => {
  const { fromParty } = usePartyRepresentation();
  return useMemo(() => {
    const permissions = accessPackage?.permissions;
    if (!permissions?.length) return [];

    const group: Record<string, Connection> = {};
    // const inheritanceRelevant = new Set<string>();

    const ensureRoot = (e: Entity): Connection => {
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
          isInherited: false,
          roles: [],
        };
        group[e.id] = { party, roles: [], connections: [] };
      }
      return group[e.id];
    };

    const ensureChild = (parent: Connection, e: Entity): Connection => {
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
            isInherited: false,
          },
          roles: [],
          connections: [],
        };
        parent.connections.push(node);
      }
      return node;
    };

    const addRole = (conn: Connection, id: string, code: string, viaParty?: Entity) => {
      if (!conn.roles.some((r) => r.code === code)) {
        conn.roles.push(viaParty ? { id, code, viaParty } : { id, code });
        // if (code !== 'rettighetshaver') inheritanceRelevant.add(conn.party.id);
      }
    };

    for (const { to, role, via, viaRole } of permissions) {
      if (via) {
        const viaConn = ensureRoot(via);
        const child = ensureChild(viaConn, to);
        if (viaRole) addRole(child, viaRole.id, viaRole.code, via);
        continue;
      }
      const root = ensureRoot(to);
      if (role) addRole(root, role.id, role.code);
    }

    const addInheritance = (conn: Connection) => {
      conn.party.isInherited =
        accessPackage?.permissions?.some((p) =>
          isInherited(p, conn.party.id, fromParty?.partyUuid || ''),
        ) || false;
      conn.connections.forEach(addInheritance);
    };

    Object.values(group).forEach(addInheritance);
    return Object.values(group);
  }, [accessPackage?.permissions, fromParty?.partyUuid]);
};

export default usePackagePermissionConnections;
