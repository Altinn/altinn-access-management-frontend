import React, { createContext, useContext, useMemo } from 'react';

import { Reason, useDelegationCheckQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface AccessPackageDelegationCheckContextProps {
  canDelegatePackage: (packageId: string) => { result: boolean; reasons: Reason[] } | undefined;
  resultMap: Record<string, { result: boolean; reasons: Reason[] }>;
  isLoading: boolean;
  isError: boolean;
  error: FetchBaseQueryError | SerializedError | undefined;
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

  const { data, isLoading, error, isError } = useDelegationCheckQuery(
    { party: actingParty?.partyUuid },
    { skip: !actingParty?.partyUuid },
  );

  const resultMap = useMemo(
    () =>
      (data ?? []).reduce<Record<string, { result: boolean; reasons: Reason[] }>>((acc, cur) => {
        acc[cur.package.id] = { result: cur.result, reasons: cur.reasons };
        return acc;
      }, {}),
    [data],
  );

  const canDelegatePackage = (packageId: string) => {
    if (isError) return { result: true, reasons: [] }; // allow try if error on delegationCheck
    if (packageId in resultMap) return resultMap[packageId];
    return undefined;
  };

  return (
    <AccessPackageDelegationCheckContext.Provider
      value={{
        canDelegatePackage,
        resultMap,
        isLoading,
        isError,
        error,
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
