import { createContext, JSX, useContext, useState } from 'react';

import { useGetPartyByUUIDQuery, type Party } from '@/rtk/features/lookupApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

interface PartyRepresentationProviderProps {
  children: JSX.Element | JSX.Element[];
  fromPartyUuid: string;
  toPartyUuid: string;
}

export interface PartyRepresentationContextOutput {
  fromParty?: Party;
  toParty?: Party;
  selfParty?: Party;
  isLoading: boolean;
}

export const PartyRepresentationContext = createContext<PartyRepresentationContextOutput | null>(
  null,
);

export const PartyRepresentationProvider = ({
  children,
  fromPartyUuid,
  toPartyUuid,
}: PartyRepresentationProviderProps) => {
  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const { data: fromParty, isLoading: fromPartyIsLoading } = useGetPartyByUUIDQuery(fromPartyUuid);
  const { data: toParty, isLoading: toPartyIsLoading } = useGetPartyByUUIDQuery(toPartyUuid);

  return (
    <PartyRepresentationContext.Provider
      value={{
        fromParty,
        toParty,
        selfParty: currentUser?.party,
        isLoading: fromPartyIsLoading || toPartyIsLoading || currentUserIsLoading,
      }}
    >
      {children}
    </PartyRepresentationContext.Provider>
  );
};

export const usePartyRepresentation = (): PartyRepresentationContextOutput => {
  const context = useContext(PartyRepresentationContext);
  if (!context) {
    throw new Error('usePartyRepresentation must be used within a PartyRepresentationProvider');
  }
  return context;
};
