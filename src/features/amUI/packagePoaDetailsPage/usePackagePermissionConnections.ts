import { useMemo } from 'react';
import { AccessPackage } from '@/rtk/features/accessPackageApi';
import { Connection, ExtendedUser } from '@/rtk/features/userInfoApi';
import { Entity } from '@/dataObjects/dtos/Common';

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
  return useMemo(() => {
    const permissions = accessPackage?.permissions;
    if (!permissions || permissions.length === 0) return [];

    const group: Record<string, Connection> = {};
    const inheritedFlags: Record<string, boolean> = {};
    const hasDirectRole: Record<string, boolean> = {};

    const ensureRootConnection = (user: Entity): Connection => {
      if (!group[user.id]) {
        const party: ExtendedUser = {
          id: user.id,
          name: user.name,
          type: user.type,
          variant: user.variant,
          children: null,
          keyValues: user.keyValues,
          isInherited: false, // will be finalized after aggregation
          roles: [],
        };
        group[user.id] = { party, roles: [], connections: [] };
      }
      return group[user.id];
    };

    const getOrCreateChildConnection = (
      parent: Connection,
      child: Entity,
      isInherited = false,
    ): Connection => {
      let node = parent.connections.find((c) => c.party.id === child.id);
      if (!node) {
        node = {
          party: {
            id: child.id,
            name: child.name,
            type: child.type,
            variant: child.variant,
            children: null,
            keyValues: child.keyValues,
            roles: [],
            isInherited,
          },
          roles: [],
          connections: [],
        };
        parent.connections.push(node);
      } else if (isInherited) {
        node.party.isInherited = true;
      }
      return node;
    };

    for (const { to, role, via, viaRole } of permissions) {
      if (via) {
        // VIA path: create/ensure intermediary (via) then the child connection under it.
        const viaConn = ensureRootConnection(via);
        const child = getOrCreateChildConnection(viaConn, to, true);
        if (viaRole && !child.roles.some((r) => r.code === viaRole.code)) {
          child.roles.push({ id: viaRole.id, code: viaRole.code, viaParty: via });
        }
        inheritedFlags[to.id] = true;
        continue;
      }

      const root = ensureRootConnection(to);

      if (role && !root.roles.some((r) => r.code === role.code)) {
        root.roles.push({ id: role.id, code: role.code });
      }
      if (role) {
        hasDirectRole[to.id] = true;
      }
    }

    const applyInheritedFlagRecursively = (conn: Connection) => {
      conn.party.isInherited =
        Boolean(inheritedFlags[conn.party.id]) && !Boolean(hasDirectRole[conn.party.id]);
      // conn.connections.forEach((child) => applyInheritedFlagRecursively(child));
    };

    Object.values(group).forEach((rootConn) => applyInheritedFlagRecursively(rootConn));

    return Object.values(group);
  }, [accessPackage?.permissions]);
};

export default usePackagePermissionConnections;
