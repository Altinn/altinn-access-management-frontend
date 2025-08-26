import React, { createContext, useContext, useMemo } from 'react';

import { useDelegationCheckQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

interface AccessPackageDelegationCheckContextProps {
  canDelegatePackage: (packageId: string) => boolean | undefined;
  resultMap: Record<string, boolean>;
  isLoading: boolean;
  error?: unknown;
  reload: () => void; // placeholder for potential future manual refetch logic
}

const AccessPackageDelegationCheckContext =
  createContext<AccessPackageDelegationCheckContextProps | null>(null);

export interface AccessPackageDelegationCheckProviderProps {
  packageIds: string[];
  children: React.ReactNode;
}

/**
 * Provides delegation-check information (can delegate or not) for the provided package ids.
 * Executes once per actingParty or packageIds change.
 */
export const AccessPackageDelegationCheckProvider = ({
  packageIds,
  children,
}: AccessPackageDelegationCheckProviderProps) => {
  const uniquePackageIds = useMemo(
    () => Array.from(new Set(packageIds.filter(Boolean))),
    [packageIds],
  );
  const { actingParty } = usePartyRepresentation();

  const { data, isLoading, error } = useDelegationCheckQuery(
    { packageIds: uniquePackageIds, party: actingParty?.partyUuid },
    { skip: uniquePackageIds.length === 0 || !actingParty?.partyUuid },
  );

  const resultMap = useMemo(() => {
    if (!data) return {};
    return data.reduce<Record<string, boolean>>((acc, cur) => {
      acc[cur.packageId] = cur.canDelegate;
      return acc;
    }, {});
  }, [data]);

  const canDelegatePackage = (packageId: string) => {
    if (packageId in resultMap) return resultMap[packageId];
    return undefined;
  };

  return (
    <AccessPackageDelegationCheckContext.Provider
      value={{
        canDelegatePackage,
        resultMap,
        isLoading,
        error,
        reload: () => {},
      }}
    >
      {children}
    </AccessPackageDelegationCheckContext.Provider>
  );
};

export const useAccessPackageDelegationCheck = (): AccessPackageDelegationCheckContextProps => {
  const ctx = useContext(AccessPackageDelegationCheckContext);
  if (!ctx) {
    throw new Error(
      'useAccessPackageDelegationCheck must be used within an AccessPackageDelegationCheckProvider',
    );
  }
  return ctx;
};
