import { useMemo } from 'react';

import type { RolePermission } from '@/rtk/features/roleApi';

type UseGroupedRoleListEntriesParams = {
  roleConnections?: RolePermission[];
};

type UseGroupedRoleListEntriesResult = {
  altinn2Roles: RolePermission[];
  userRoles: RolePermission[];
};

export const useGroupedRoleListEntries = ({
  roleConnections,
}: UseGroupedRoleListEntriesParams): UseGroupedRoleListEntriesResult => {
  const { altinn2Roles, userRoles } = useMemo(() => {
    if (!roleConnections) {
      return {
        altinn2Roles: [],
        userRoles: [],
      };
    }

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const groups = {
      altinn2Roles: [] as RolePermission[],
      userRoles: [] as RolePermission[],
    };

    roleConnections.forEach((connection) => {
      const providerCode = connection.role.provider?.code;

      if (providerCode === 'sys-altinn2') {
        groups.altinn2Roles.push(connection);
      } else if (providerCode === 'sys-ccr') {
        groups.userRoles.push(connection);
      }
    });

    groups.altinn2Roles.sort((a, b) => collator.compare(a.role.name, b.role.name));
    groups.userRoles.sort((a, b) => collator.compare(a.role.name, b.role.name));

    return groups;
  }, [roleConnections]);

  return {
    altinn2Roles,
    userRoles,
  };
};
