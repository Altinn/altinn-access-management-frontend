import { useCallback, useMemo } from 'react';

import { useGetAllRolesQuery, type Role } from '@/rtk/features/roleApi';

type RoleMetadataMap = Record<string, Role | undefined>;

/**
 * Fetches all role metadata once and provides a helper to look up metadata by role id.
 */
export const useRoleMetadata = () => {
  const { data: allRoles, isFetching } = useGetAllRolesQuery();

  const roleMetadataMap = useMemo(() => {
    if (!allRoles) {
      return {};
    }

    return allRoles.reduce<RoleMetadataMap>((acc, role) => {
      acc[role.id] = role;
      return acc;
    }, {});
  }, [allRoles]);

  const getRoleMetadata = useCallback(
    (roleId?: string | null) => {
      if (!roleId) {
        return undefined;
      }
      return roleMetadataMap[roleId];
    },
    [roleMetadataMap],
  );

  return { getRoleMetadata, isLoading: isFetching };
};
