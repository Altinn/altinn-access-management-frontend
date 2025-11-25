import { useCallback } from 'react';

import type { Connection } from '@/rtk/features/connectionApi';

import { useRoleMetadata } from './useRoleMetadata';

const ECC_PROVIDER_CODE = 'sys-ccr';

export const useRoleMapper = () => {
  const { getRoleMetadata, isLoading: loadingRoleMetadata } = useRoleMetadata();

  const mapRoles = useCallback(
    (roles?: Connection['roles']) => {
      if (loadingRoleMetadata) {
        return [];
      }

      return (
        roles
          ?.map((role) => {
            const metadata = getRoleMetadata(role.id);
            if (metadata?.provider?.code && metadata.provider.code !== ECC_PROVIDER_CODE) {
              return null;
            }
            return {
              ...role,
              code: metadata?.code ?? role.code,
              displayName: metadata?.name ?? role.displayName ?? role.code,
            };
          })
          .filter((role): role is NonNullable<typeof role> => role !== null) ?? []
      );
    },
    [getRoleMetadata, loadingRoleMetadata],
  );

  return { mapRoles, loadingRoleMetadata };
};
