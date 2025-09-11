import * as React from 'react';
import { useGetOrgDataQuery } from '@/rtk/features/altinnCdnApi';

/**
 * Hook that returns a resolver for provider/org logo URLs based on org code.
 * Falls back to emblem, then logo. Returns undefined while loading or if not found.
 */
export const useProviderLogoUrl = () => {
  const { data: orgData, isLoading } = useGetOrgDataQuery();

  const getProviderLogoUrl = React.useCallback(
    (orgCode: string | null | undefined): string | undefined => {
      if (!orgData || isLoading) return undefined;
      const org = orgCode ? orgData[orgCode] : undefined;
      return org?.emblem ?? org?.logo ?? undefined;
    },
    [orgData, isLoading],
  );

  return { getProviderLogoUrl, isLoading } as const;
};
