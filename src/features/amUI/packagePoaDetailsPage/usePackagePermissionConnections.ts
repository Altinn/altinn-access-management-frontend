import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { ExtendedUser } from '@/rtk/features/userInfoApi';
import { Entity } from '@/dataObjects/dtos/Common';
import { Connection } from '@/rtk/features/connectionApi';

/**
 * Temporary transformation hook.
 *
 * Converts AccessPackage.permissions (flat list of permission relations) into the hierarchical
 * Connection[] structure expected by AdvancedUserSearch (mirroring the /rightholders endpoint result).
 * This will become unnecessary once (or if) the backend exposes permissions in the same structured
 * format as the connections endpoint. When that happens, replace usages of this hook with the direct
 * backend response and remove this file.
 */

export const usePackagePermissionConnections = (accessPackage?: AccessPackage): Connection[] =>
  useMemo(() => {
    const permissions = accessPackage?.permissions;
    if (!permissions?.length) return [];

    const group: Record<string, Connection> = {};
    const inheritanceRelevant = new Set<string>();

    const ensureRoot = (e: Entity): Connection => {
      if (!group[e.id]) {
        const party: ExtendedUser = {
          id: e.id,
          name: e.name,
          type: e.type,
          variant: e.variant,
          children: null,
          keyValues: e.keyValues,
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
            children: null,
            keyValues: e.keyValues,
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
        if (code !== 'rettighetshaver') inheritanceRelevant.add(conn.party.id);
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

    const finalize = (conn: Connection) => {
      conn.party.isInherited = inheritanceRelevant.has(conn.party.id);
      conn.connections.forEach(finalize);
    };

    Object.values(group).forEach(finalize);
    return Object.values(group);
  }, [accessPackage?.permissions]);

export default usePackagePermissionConnections;
