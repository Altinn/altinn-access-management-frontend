import type { JSX } from 'react';
import { createContext, useContext } from 'react';
import { DsAlert, DsParagraph } from '@altinn/altinn-components';
import { type SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Link } from 'react-router';
import { t } from 'i18next';

import { useGetPartyFromLoggedInUserQuery, type Party } from '@/rtk/features/lookupApi';
import { availableForUserTypeCheck } from '@/resources/utils/featureFlagUtils';

import { TechnicalErrorParagraphs } from '../TechnicalErrorParagraphs';
import { createErrorDetails } from '../TechnicalErrorParagraphs/TechnicalErrorParagraphs';
import { NotAvailableForUserTypeAlert } from '../NotAvailableForUserTypeAlert/NotAvailableForUserTypeAlert';
import { AccessPackageDelegationCheckProvider } from '../DelegationCheck/AccessPackageDelegationCheckContext';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { useReporteeParty } from './useReporteeParty';
import { useConnectedParty } from './useConnectedParty';

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
  /** Optional loading component to show while data is being fetched */
  loadingComponent?: JSX.Element;
  /** Optional override for loading state */
  isLoading?: boolean;
  /** If true, an error alert will be shown if the acting party has 'person' user type */
  errorOnPriv?: boolean;
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
  loadingComponent,
  isLoading: externalIsLoading,
  errorOnPriv = false,
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

  const { data: currentUser, isLoading: currentUserIsLoading } = useGetPartyFromLoggedInUserQuery();
  const { party: reportee, isLoading: reporteeIsLoading } = useReporteeParty();

  const { party: fromConnectedParty, isLoading: fromPartyIsLoading } = useConnectedParty({
    fromPartyUuid,
    skip:
      !fromPartyUuid ||
      fromPartyUuid === actingPartyUuid ||
      fromPartyUuid === currentUser?.partyUuid ||
      fromPartyUuid === reportee?.partyUuid,
  });

  const { party: toConnectedParty, isLoading: toPartyIsLoading } = useConnectedParty({
    toPartyUuid,
    skip:
      !toPartyUuid ||
      toPartyUuid === actingPartyUuid ||
      toPartyUuid === currentUser?.partyUuid ||
      toPartyUuid === reportee?.partyUuid,
  });

  let actingParty: Party | undefined;
  if (actingPartyUuid === currentUser?.partyUuid) {
    // User is on their own page
    actingParty = currentUser;
  } else {
    // Acting on behalf of another party (reportee)
    actingParty = reportee;
  }

  const fromParty =
    fromPartyUuid === actingPartyUuid
      ? actingParty
      : fromPartyUuid === reportee?.partyUuid
        ? reportee
        : fromConnectedParty;

  const toParty =
    toPartyUuid === actingPartyUuid
      ? actingParty
      : toPartyUuid === currentUser?.partyUuid
        ? currentUser
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
    reporteeIsLoading || availableForUserTypeCheck(actingParty?.partyTypeName?.toString());

  const isLoading =
    externalIsLoading ||
    isConnectionLoading ||
    fromPartyIsLoading ||
    toPartyIsLoading ||
    currentUserIsLoading ||
    reporteeIsLoading;

  const invalidConnection =
    !isConnectionLoading &&
    !!fromPartyUuid &&
    !!toPartyUuid &&
    (connections?.length === 0 || connections === undefined);

  const isError = !fromParty && !toParty;

  const shouldShowUserTypeRestrictionAlert = !isLoading && !availableForUserType && errorOnPriv;

  if (isLoading && loadingComponent) {
    return loadingComponent;
  }

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
      {shouldShowUserTypeRestrictionAlert && <NotAvailableForUserTypeAlert />}
      {isError && !isLoading && !invalidConnection && (
        <DsAlert data-color='warning'>
          <DsParagraph>{t('error_page.acting_party_data_error')}</DsParagraph>
        </DsAlert>
      )}
      <AccessPackageDelegationCheckProvider>
        {!isError &&
          !isLoading &&
          !shouldShowUserTypeRestrictionAlert &&
          !invalidConnection &&
          children}
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
