import { useCallback, useMemo, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useGetAllRolesQuery, type Role } from '@/rtk/features/roleApi';
import type { RoleInfo } from '@/rtk/features/connectionApi';

type RoleMetadataMap = Record<string, Role | undefined>;

export const ECC_PROVIDER_CODE = 'sys-ccr';
export const A2_PROVIDER_CODE = 'sys-altinn2';
export const A3_PROVIDER_CODE = 'sys-altinn3';

/**
 * Fetches all role metadata once and provides helpers to look up and map metadata by role id.
 */
export const useRoleMetadata = () => {
  const { i18n } = useTranslation();
  const {
    data: allRoles,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllRolesQuery({
    language: i18n.language,
  });

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
      if (!roleId || !roleMetadataMap) {
        return undefined;
      }
      return roleMetadataMap[roleId];
    },
    [roleMetadataMap],
  );

  const mapRoles = useCallback(
    (roles?: (Role | RoleInfo)[]) => {
      if (isLoading || isError) {
        return [];
      }

      return (
        roles
          ?.map((role) => {
            const metadata = getRoleMetadata(role.id);
            return metadata ?? null;
          })
          .filter((role): role is NonNullable<typeof role> => role !== null) ?? []
      );
    },
    [getRoleMetadata, isError, isLoading],
  );

  return { getRoleMetadata, mapRoles, isLoading, isError, error };
};
