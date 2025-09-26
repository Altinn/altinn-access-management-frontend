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
    // Track whether a user should be marked inherited based on ANY of its direct roles
    const inheritedFlags: Record<string, boolean> = {};

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
      } else {
        user.children?.forEach((child) => {
          if (!group[user.id].connections?.find((c) => c.party.id === child.id)) {
            group[user.id].connections.push({
              party: {
                id: child.id,
                name: child.name,
                type: child.type,
                variant: child.variant,
                children: null,
                keyValues: child.keyValues,
                isInherited: true, // always treated as inherited when via
                roles: [],
              },
              roles: [],
              connections: [],
            });
          }
        });
      }
      return group[user.id];
    };

    for (const { to, role, via, viaRole } of permissions) {
      if (via) {
        // VIA path: create/ensure intermediary (via) then the child connection under it.
        const viaConn = ensureRootConnection(via);
        let child = viaConn.connections.find((c) => c.party.id === to.id);
        if (!child) {
          child = {
            party: {
              id: to.id,
              name: to.name,
              type: to.type,
              variant: to.variant,
              children: null,
              keyValues: to.keyValues,
              roles: [],
              isInherited: true, // always treated as inherited when via
            },
            roles: [],
            connections: [],
          };
          viaConn.connections.push(child);
        }
        if (viaRole && !child.roles.some((r) => r.code === viaRole.code)) {
          child.roles.push({ id: viaRole.id, code: viaRole.code, viaParty: via });
        }
        continue; // done with via case
      }

      const root = ensureRootConnection(to);

      if (role && !root.roles.some((r) => r.code === role.code)) {
        root.roles.push({ id: role.id, code: role.code });
      }

      if (role && role.code !== 'rettighetshaver') {
        inheritedFlags[to.id] = true;
      }
    }

    // Finalize inheritance after aggregating all roles for each user
    Object.values(group).forEach((conn) => {
      conn.party.isInherited = !!inheritedFlags[conn.party.id];
    });

    return Object.values(group);
  }, [accessPackage?.permissions]);
};

export default usePackagePermissionConnections;
