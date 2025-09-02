import React, { createContext, useContext, useMemo } from 'react';

import { useDelegationCheckQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

type reasonsMap = Record<string, string>;

interface AccessPackageDelegationCheckContextProps {
  canDelegatePackage: (packageId: string) => { result: boolean; reasons: reasonsMap } | undefined;
  resultMap: Record<string, { result: boolean; reasons: reasonsMap }>;
  isLoading: boolean;
  error?: unknown;
  reload: () => void; // placeholder for potential future manual refetch logic
}

const AccessPackageDelegationCheckContext =
  createContext<AccessPackageDelegationCheckContextProps | null>(null);

export interface AccessPackageDelegationCheckProviderProps {
  children: React.ReactNode;
}

/**
 * Provides delegation-check information (can delegate or not) for the provided package ids.
 * Executes once per actingParty or packageIds change.
 */
export const AccessPackageDelegationCheckProvider = ({
  children,
}: AccessPackageDelegationCheckProviderProps) => {
  const { actingParty } = usePartyRepresentation();

  const { data, isLoading, error } = useDelegationCheckQuery(
    { party: actingParty?.partyUuid },
    { skip: !actingParty?.partyUuid },
  );

  const resultMap = useMemo(
    () =>
      (data ?? []).reduce<Record<string, { result: boolean; reasons: reasonsMap }>>((acc, cur) => {
        acc[cur.package.id] = { result: cur.result, reasons: cur.reasons };
        return acc;
      }, {}),
    [data],
  );

  console.log('🪵 ~ AccessPackageDelegationCheckProvider ~ resultMap:', resultMap);

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
