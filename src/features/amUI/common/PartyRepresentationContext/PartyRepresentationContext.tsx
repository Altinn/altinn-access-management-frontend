import type { JSX } from 'react';
import { createContext, useContext } from 'react';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Link } from 'react-router';
import { t } from 'i18next';

import { useGetPartyByUUIDQuery, type Party } from '@/rtk/features/lookupApi';
import { useGetRightHoldersQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';

interface PartyRepresentationProviderProps {
  /** The children to be rendered with the provided party-representation data */
  children: JSX.Element | JSX.Element[];
  /** The uuid of the party which is performing access aministration */
  actingPartyUuid: string;
  /** The uuid of the party whose accesses is provided */
  fromPartyUuid?: string;
  /** The uuid of the party that has/is reveiving accesses */
  toPartyUuid?: string;
  /** On connection error, the user will be provided with a link to this url in order to get them to a page with a valid state */
  returnToUrlOnError?: string;
}

export interface PartyRepresentationContextOutput {
  fromParty?: Party;
  toParty?: Party;
  actingParty?: Party;
  selfParty?: Party;
  isLoading?: boolean;
  isError?: boolean;
}

export const PartyRepresentationContext = createContext<PartyRepresentationContextOutput | null>(
  null,
);

/// <PartyRepresentationProvider /> is used to provide the context for the party representation
/// in the application. It fetches the party information for the current user and the parties
/// involved in the delegation process. The context is then used by other components to access
/// the party information without having to pass it down through props.
///
/// If both `fromPartyUuid` and `toPartyUuid` are not provided, an error is thrown.
/// If `actingPartyUuid` is not provided, an error is thrown.
/// If the connection between the parties is invalid, an error alert is displayed
/// and the children are not rendered. The error alert provides details about the error and a link to return to a valid state if `returnToUrlOnError` is provided.
export const PartyRepresentationProvider = ({
  children,
  fromPartyUuid,
  toPartyUuid,
  actingPartyUuid,
  returnToUrlOnError,
}: PartyRepresentationProviderProps) => {
  if (!toPartyUuid && !fromPartyUuid) {
    throw new Error('PartyRepresentationProvider must be used with at least one party UUID');
  }
  if (!actingPartyUuid) {
    throw new Error('PartyRepresentationProvider must be used with an acting party UUID');
  }

  const {
    data: connections,
    isLoading: isConnectionLoading,
    error,
  } = useGetRightHoldersQuery(
    { fromUuid: fromPartyUuid ?? '', toUuid: toPartyUuid ?? '', partyUuid: fromPartyUuid ?? '' },
    { skip: !fromPartyUuid || !toPartyUuid },
  );

  const invalidConnection =
    !isConnectionLoading &&
    !!fromPartyUuid &&
    !!toPartyUuid &&
    (connections?.length === 0 || connections === undefined);

  const { data: currentUser, isLoading: currentUserIsLoading } = useGetUserInfoQuery();
  const { data: fromParty, isLoading: fromPartyIsLoading } = useGetPartyByUUIDQuery(
    fromPartyUuid ?? '',
    { skip: isConnectionLoading || invalidConnection || (!!toPartyUuid && !connections) },
  );
  const { data: toParty, isLoading: toPartyIsLoading } = useGetPartyByUUIDQuery(toPartyUuid ?? '', {
    skip: isConnectionLoading || invalidConnection || (!!fromPartyUuid && !connections),
  });

  return (
    <PartyRepresentationContext.Provider
      value={{
        fromParty: invalidConnection ? undefined : fromParty,
        toParty: invalidConnection ? undefined : toParty,
        actingParty: fromPartyUuid == actingPartyUuid ? fromParty : toParty,
        selfParty: currentUser?.party,
        isLoading:
          isConnectionLoading || fromPartyIsLoading || toPartyIsLoading || currentUserIsLoading,
        isError: invalidConnection,
      }}
    >
      {invalidConnection ? connectionErrorAlert(error, returnToUrlOnError) : children}
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

const connectionErrorAlert = (
  error: FetchBaseQueryError | SerializedError | undefined,
  returnToUrl?: string,
) => {
  if (error) {
    const errorDetails = createErrorDetails(error);
    return (
      <DsAlert data-color='danger'>
        <TechnicalErrorParagraphs
          status={errorDetails?.status ?? ''}
          time={errorDetails?.time ?? ''}
        />
      </DsAlert>
    );
  }

  return (
    <DsAlert data-color='warning'>
      <DsParagraph>
        {t('error_page.user_connection_error')}
        {returnToUrl && <Link to={returnToUrl}>{t('common.go_back')}</Link>}
      </DsParagraph>
    </DsAlert>
  );
};
