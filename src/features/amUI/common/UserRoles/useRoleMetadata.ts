import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useGetAllRolesQuery, type Role } from '@/rtk/features/roleApi';
import type { RoleInfo } from '@/rtk/features/connectionApi';

type RoleMetadataMap = {
  byId: Record<string, Role | undefined>;
  byCode: Record<string, Role | undefined>;
};

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
  } = useGetAllRolesQuery({
    language: i18n.language,
  });

  const roleMetadataMap = useMemo(() => {
    if (!allRoles) {
      return { byId: {}, byCode: {} };
    }

    return allRoles.reduce<RoleMetadataMap>(
      (acc, role) => {
        acc.byId[role.id] = role;
        if (role.code) {
          acc.byCode[role.code] = role;
        }
        return acc;
      },
      { byId: {}, byCode: {} },
    );
  }, [allRoles]);

  const getRoleMetadata = useCallback(
    (roleId?: string | null) => {
      if (!roleId) {
        return undefined;
      }
      return roleMetadataMap.byId[roleId];
    },
    [roleMetadataMap],
  );

  const getRoleByCode = useCallback(
    (roleCode?: string | null) => {
      if (!roleCode) {
        return undefined;
      }
      return roleMetadataMap.byCode[roleCode];
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

  return { getRoleMetadata, getRoleByCode, mapRoles, isLoading, isError, error };
};
