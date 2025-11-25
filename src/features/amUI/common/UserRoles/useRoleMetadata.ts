import { useCallback, useMemo, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useGetAllRolesQuery, type Role } from '@/rtk/features/roleApi';

type RoleMetadataMap = Record<string, Role | undefined>;

/**
 * Fetches all role metadata once and provides a helper to look up metadata by role id.
 */
export const useRoleMetadata = () => {
  const { i18n } = useTranslation();
  const { data: allRoles, isFetching, refetch } = useGetAllRolesQuery({ language: i18n.language });

  // Refetch when language changes to ensure fresh translated data
  useEffect(() => {
    refetch();
  }, [i18n.language, refetch]);

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
