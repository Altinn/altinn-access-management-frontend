import type { JSX } from 'react';
import { createContext, useContext } from 'react';

import { useGetPartyByUUIDQuery, type Party } from '@/rtk/features/lookupApi';
import { useGetRightHoldersQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

interface PartyRepresentationProviderProps {
  children: JSX.Element | JSX.Element[];
  fromPartyUuid?: string;
  toPartyUuid?: string;
  actingPartyUuid?: string;
}

export interface PartyRepresentationContextOutput {
  fromParty?: Party;
  toParty?: Party;
  actingParty?: Party;
  selfParty?: Party;
  isLoading: boolean;
}

export const PartyRepresentationContext = createContext<PartyRepresentationContextOutput | null>(
  null,
);

/// <PartyRepresentationProvider /> is used to provide the context for the party representation
/// in the application. It fetches the party information for the current user and the parties
/// involved in the delegation process. The context is then used by other components to access
/// the party information without having to pass it down through props.
///
/// It is important to note that this context uses the `useGetPartyByUUIDQuery` hook, and thus
/// must not be used outside of internal applications.
export const PartyRepresentationProvider = ({
  children,
  fromPartyUuid,
  toPartyUuid,
  actingPartyUuid,
}: PartyRepresentationProviderProps) => {
  if (!toPartyUuid && !fromPartyUuid) {
    throw new Error('PartyRepresentationProvider must be used with at least one party UUID');
  }
  if (!actingPartyUuid) {
    throw new Error('PartyRepresentationProvider must be used with an acting party UUID');
  }

  const { data: connections, isLoading: isConnectionLoading } = useGetRightHoldersQuery(
    { fromUuid: fromPartyUuid ?? '', toUuid: toPartyUuid ?? '', partyUuid: fromPartyUuid ?? '' },
    { skip: !fromPartyUuid || !toPartyUuid },
  );

  if (connections?.length === 0) {
    throw new Error(
      'Cannot use PartyRepresentationProvider without a connection between the two provided parties',
    );
  }

  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const { data: fromParty, isLoading: fromPartyIsLoading } = useGetPartyByUUIDQuery(
    fromPartyUuid ?? '',
    { skip: isConnectionLoading || (!!toPartyUuid && !connections) },
  );
  const { data: toParty, isLoading: toPartyIsLoading } = useGetPartyByUUIDQuery(toPartyUuid ?? '', {
    skip: isConnectionLoading || (!!fromPartyUuid && !connections),
  });

  return (
    <PartyRepresentationContext.Provider
      value={{
        fromParty,
        toParty,
        actingParty: fromPartyUuid == actingPartyUuid ? fromParty : toParty,
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
