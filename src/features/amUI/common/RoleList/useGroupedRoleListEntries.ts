import { useMemo } from 'react';

import type { RolePermission } from '@/rtk/features/roleApi';
import {
  A2_PROVIDER_CODE,
  ECC_PROVIDER_CODE,
  A3_PROVIDER_CODE,
  CRA_PROVIDER_CODE,
} from '../UserRoles/useRoleMetadata';

type UseGroupedRoleListEntriesParams = {
  permissions?: RolePermission[];
};

type UseGroupedRoleListEntriesResult = {
  altinn2Roles: RolePermission[];
  altinn3Roles: RolePermission[];
  userRoles: RolePermission[];
  guardianshipRoles: RolePermission[];
};

export const useGroupedRoleListEntries = ({
  permissions,
}: UseGroupedRoleListEntriesParams): UseGroupedRoleListEntriesResult => {
  const { altinn2Roles, altinn3Roles, userRoles, guardianshipRoles } = useMemo(() => {
    if (!permissions) {
      return {
        altinn2Roles: [],
        altinn3Roles: [],
        userRoles: [],
        guardianshipRoles: [],
      };
    }

    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    const groups = {
      altinn2Roles: [] as RolePermission[],
      altinn3Roles: [] as RolePermission[],
      userRoles: [] as RolePermission[],
      guardianshipRoles: [] as RolePermission[],
    };

    permissions.forEach((connection) => {
      const providerCode = connection.role?.provider?.code;
      if (!providerCode) {
        return;
      }
      if (providerCode === A2_PROVIDER_CODE) {
        groups.altinn2Roles.push(connection);
      } else if (providerCode === ECC_PROVIDER_CODE) {
        groups.userRoles.push(connection);
      } else if (providerCode === A3_PROVIDER_CODE) {
        groups.altinn3Roles.push(connection);
      } else if (providerCode === CRA_PROVIDER_CODE) {
        groups.guardianshipRoles.push(connection);
      }
    });

    groups.altinn2Roles.sort((a, b) => collator.compare(a.role?.name ?? '', b.role?.name ?? ''));
    groups.altinn3Roles.sort((a, b) => collator.compare(a.role?.name ?? '', b.role?.name ?? ''));
    groups.userRoles.sort((a, b) => collator.compare(a.role?.name ?? '', b.role?.name ?? ''));
    groups.guardianshipRoles.sort((a, b) =>
      collator.compare(a.role?.name ?? '', b.role?.name ?? ''),
    );

    return groups;
  }, [permissions]);

  return {
    altinn2Roles,
    altinn3Roles,
    userRoles,
    guardianshipRoles,
  };
};
