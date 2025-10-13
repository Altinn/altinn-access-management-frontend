import type { JSX } from 'react';
import { createContext, useContext } from 'react';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Link } from 'react-router';
import { t } from 'i18next';

import { useGetPartyFromLoggedInUserQuery, type Party } from '@/rtk/features/lookupApi';
import { Connection, useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';
import { availableForUserTypeCheck } from '@/resources/utils/featureFlagUtils';

import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { NotAvailableForUserTypeAlert } from '../NotAvailableForUserTypeAlert/NotAvailableForUserTypeAlert';
import { AccessPackageDelegationCheckProvider } from '../DelegationCheck/AccessPackageDelegationCheckContext';
import useConnectedParty from './useConnectedParty';
import { useReporteeParty } from './useReporteeParty';
import { getCookie } from '@/resources/Cookie/CookieMethods';
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

  // Case du er på din egen side i tilgangsstyring og ikke hovedadmin -> acting-party = selfparty. (vi kan sjekke is-admin fram til vi får en egen ressurs på hovedadmin)
  // ellers hentes acting-party fra useReporteeParty

  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();

  const partyUuid = getCookie('AltinnPartyUuid') ?? '';
  const { party: reportee, isLoading: actingPartyIsLoading } = useReporteeParty();

  let actingParty: Party | undefined;

  // 1. Hvis inlogget bruker er damme som from eller to id  da er acting-party = selfparty. Hvis ikke: Acting-party hentes fra useReporteeParty
  if (currentUser?.partyUuid === partyUuid) {
    actingParty = currentUser;
  } else {
    actingParty = reportee;
  }

  // Call hooks unconditionally, then decide values
  const { party: fromConnectedParty, isLoading: fromPartyIsLoading } = useConnectedParty({
    fromPartyUuid,
    skip: !fromPartyUuid || fromPartyUuid === actingPartyUuid,
  });

  const { party: toConnectedParty, isLoading: toPartyIsLoading } = useConnectedParty({
    toPartyUuid,
    skip: !toPartyUuid || toPartyUuid === actingPartyUuid,
  });

  // 2. From-party: hvis satt og er lik actingpartyUuid, da er from-party = acting-party. Hvis ikke bruk connected party
  const fromParty: Party | undefined =
    fromPartyUuid !== undefined
      ? undefined
      : fromPartyUuid === actingPartyUuid
        ? actingParty
        : fromConnectedParty;

  // 3. To-party: hvis satt og er lik actingpartyUuid, da er to-party = acting-party. Hvis ikke bruk connected party
  const toParty: Party | undefined =
    toPartyUuid !== undefined
      ? undefined
      : toPartyUuid === actingPartyUuid
        ? actingParty
        : toConnectedParty;

  const {
    data: connections,
    isLoading: isConnectionLoading,
    error,
  } = useGetRightHoldersQuery(
    { fromUuid: fromPartyUuid ?? '', toUuid: toPartyUuid ?? '', partyUuid: actingPartyUuid ?? '' },
    { skip: !fromPartyUuid || !toPartyUuid },
  );

  const availableForUserType =
    actingPartyIsLoading || availableForUserTypeCheck(actingParty?.partyTypeName.toString());

  const isLoading =
    isConnectionLoading ||
    fromPartyIsLoading ||
    toPartyIsLoading ||
    currentUserIsLoading ||
    actingPartyIsLoading;

  const invalidConnection =
    !isConnectionLoading &&
    !!fromPartyUuid &&
    !!toPartyUuid &&
    (connections?.length === 0 || connections === undefined);

  const isError = (!fromParty && !toParty) || !availableForUserType;

  return (
    <PartyRepresentationContext.Provider
      value={{
        fromParty: invalidConnection || !fromParty ? undefined : fromParty,
        toParty: invalidConnection ? undefined : toParty,
        actingParty: actingParty,
        selfParty: currentUser,
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
