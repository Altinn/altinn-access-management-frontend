import type { JSX } from 'react';
import { act, createContext, useContext } from 'react';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Link } from 'react-router';
import { t } from 'i18next';

import {
  useGetPartyByUUIDQuery,
  useGetPartyFromLoggedInUserQuery,
  type Party,
} from '@/rtk/features/lookupApi';
import {
  Connection,
  useGetReporteeQuery,
  useGetRightHoldersQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfoApi';
import { availableForUserTypeCheck } from '@/resources/utils/featureFlagUtils';

import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { NotAvailableForUserTypeAlert } from '../NotAvailableForUserTypeAlert/NotAvailableForUserTypeAlert';
import { AccessPackageDelegationCheckProvider } from '../DelegationCheck/AccessPackageDelegationCheckContext';
import useConnectedParty from './useConnectedParty';
import { skip } from 'node:test';

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
  selfPartyConnection?: Connection;
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
  if (actingPartyUuid !== fromPartyUuid && actingPartyUuid !== toPartyUuid) {
    throw new Error('actingPartyUuid must equal one of the provided party UUIDs');
  }

  const {
    data: connections,
    isLoading: isConnectionLoading,
    error,
  } = useGetRightHoldersQuery(
    { fromUuid: fromPartyUuid ?? '', toUuid: toPartyUuid ?? '', partyUuid: actingPartyUuid ?? '' },
    { skip: !fromPartyUuid || !toPartyUuid },
  );

  const invalidConnection =
    !isConnectionLoading &&
    !!fromPartyUuid &&
    !!toPartyUuid &&
    (connections?.length === 0 || connections === undefined);

  // const partyUuid = getCookie('AltinnPartyUuid');
  // const { data, isLoading } = useGetRightHoldersQuery(
  //   { partyUuid, fromUuid: partyUuid, toUuid: selfPartyUuid },
  //   { skip: !partyUuid || !selfPartyUuid },
  // );

  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();

  // this is the acting party's connection to the current user,
  // where the party is the current user
  const {
    partyConnection: selfPartyConnection,
    party: selfParty,
    isLoading: selfPartyIsLoading,
  } = useConnectedParty({
    partyUuid: actingPartyUuid,
    fromUuid: actingPartyUuid,
    toUuid: currentUser?.partyUuid,
    skip: !currentUser?.partyUuid || !actingPartyUuid,
  });

  // console.log('🪵 ~ PartyRepresentationProvider ~ selfParty:', selfParty?.name);

  // const { data: old_currentUser } = useGetUserInfoQuery();
  // console.log('🪵 ~ PartyRepresentationProvider ~ old_currentUser:', old_currentUser?.name);

  // this is the connection between acting party and the current user,
  // where the party is the acting party

  const {
    partyConnection: actingPartyConnection,
    party: actingParty,
    isLoading: actingPartyIsLoading,
  } = useConnectedParty({
    partyUuid: currentUser?.partyUuid,
    fromUuid: actingPartyUuid,
    toUuid: currentUser?.partyUuid,
    skip: !currentUser?.partyUuid || !actingPartyUuid,
  });

  // console.log('🪵 ~ PartyRepresentationProvider ~ actingParty:', actingParty?.name);

  // this is the connection between the acting party and fromParty where the party is the acting party
  const {
    partyConnection: fromPartyConnection,
    party: fromParty,
    isLoading: fromPartyIsLoading,
  } = useConnectedParty({
    partyUuid: currentUser?.partyUuid,
    fromUuid: fromPartyUuid,
    toUuid: currentUser?.partyUuid,
    skip: !currentUser?.partyUuid || !fromPartyUuid,
  });

  const { data: old_fromParty } = useGetPartyByUUIDQuery(
    { partyUuid: fromPartyUuid ?? '' },
    { skip: isConnectionLoading || invalidConnection || (!!toPartyUuid && !connections) },
  );

  console.log('🪵 ~ PartyRepresentationProvider ~ fromParty:', fromParty?.name);
  console.log('🪵 ~ PartyRepresentationProvider ~ old_fromParty:', old_fromParty?.name);

  // this is the connection between the acting party and toParty where the party is the acting party
  const {
    partyConnection: toPartyConnection,
    party: toParty,
    isLoading: toPartyIsLoading,
  } = useConnectedParty({
    partyUuid: actingPartyUuid,
    fromUuid: fromPartyUuid || actingPartyUuid,
    toUuid: toPartyUuid,
    skip: !currentUser?.partyUuid || !toPartyUuid,
  });

  const { data: old_toParty } = useGetPartyByUUIDQuery(
    { partyUuid: toPartyUuid ?? '' },
    {
      skip: isConnectionLoading || invalidConnection || (!!fromPartyUuid && !connections),
    },
  );

  console.log('🪵 ~ PartyRepresentationProvider ~ toParty:', toParty?.name);
  console.log('🪵 ~ PartyRepresentationProvider ~ old_toParty:', old_toParty?.name);

  // const { data: reportee, isLoading: reporteeIsLoading } = useGetReporteeQuery();
  // console.log('🪵 ~ PartyRepresentationProvider ~ reportee:', reportee);

  const availableForUserType =
    actingPartyIsLoading || availableForUserTypeCheck(actingParty?.partyTypeName.toString());

  const isLoading =
    isConnectionLoading ||
    fromPartyIsLoading ||
    toPartyIsLoading ||
    currentUserIsLoading ||
    actingPartyIsLoading;
  const isError = invalidConnection || !availableForUserType;

  return (
    <PartyRepresentationContext.Provider
      value={{
        fromParty: invalidConnection || !fromParty ? undefined : fromParty,
        toParty: invalidConnection ? undefined : toParty,
        actingParty: fromPartyUuid == actingPartyUuid ? fromParty : toParty,
        selfParty: currentUser,
        selfPartyConnection: selfPartyConnection,
        isLoading: isLoading,
        isError: isError,
      }}
    >
      {!isLoading && invalidConnection && connectionErrorAlert(error, returnToUrlOnError)}
      {!isLoading && !availableForUserType && <NotAvailableForUserTypeAlert />}
      <AccessPackageDelegationCheckProvider>
        {(!isError || isLoading) && children}
      </AccessPackageDelegationCheckProvider>
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
  if (error && 'status' in error && error.status !== 403) {
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
