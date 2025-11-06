import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  GlobalHeaderProps,
  Layout,
  RootProvider,
} from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveConsentRequestMutation,
  useGetConsentRequestQuery,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import type { ConsentLanguage, ConsentLocale, ConsentRequest, ProblemDetail } from '../types';
import { isAccepted, isExpired, isRevoked, replaceStaticMetadata } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';
import { ConsentStatus } from '../components/ConsentStatus/ConsentStatus';
import { useNewHeader } from '@/resources/utils/featureFlagUtils';
import { useHeader } from '../../common/PageLayoutWrapper/useHeader';

export const ConsentRequestPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('consent_request.page_title'));
  const [searchParams] = useSearchParams();
  const useNewHeaderFlag = useNewHeader();
  const { header, languageCode: language } = useHeader();
  const requestId = searchParams.get('id') ?? '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetConsentRequestQuery(
    { requestId: requestId },
    {
      skip: !requestId,
    },
  );

  const memoizedRequest = useMemo(() => {
    return request
      ? replaceStaticMetadata<ConsentRequest>(request, [
          'title',
          'heading',
          'serviceIntro',
          'consentMessage',
          'expiration',
          'handledBy',
        ])
      : null;
  }, [request]);

  const headerCondig = header as GlobalHeaderProps;
  // set current to request fromParty
  const currentAccount = headerCondig.accountSelector?.accountMenu.items.find(
    (item) => item.id === memoizedRequest?.fromParty.id.split(':').pop(),
  );
  return (
    <RootProvider>
      <Layout
        useGlobalHeader={useNewHeaderFlag}
        color='neutral'
        theme='subtle'
        header={{
          ...header,
          accountSelector: {
            ...headerCondig.accountSelector,
            accountMenu: {
              ...headerCondig.accountSelector?.accountMenu,
              currentAccount: currentAccount,
              items: [],
            },
          },
        }}
      >
        <div className={classes.centerBlock}>
          {isLoadingRequest && (
            <DsSpinner
              aria-label={t('consent_request.loading_consent')}
              data-size='xl'
            />
          )}
          {loadRequestError && (
            <ConsentRequestError
              error={loadRequestError as { data: ProblemDetail }}
              defaultError='consent_request.load_consent_error'
            />
          )}
        </div>
        {memoizedRequest && (
          <ConsentRequestContent
            request={memoizedRequest}
            language={language as ConsentLocale}
          />
        )}
      </Layout>
    </RootProvider>
  );
};

interface ConsentRequestContentProps {
  request: ConsentRequest;
  language: keyof ConsentLanguage;
}
const ConsentRequestContent = ({ request, language }: ConsentRequestContentProps): ReactElement => {
  const { t } = useTranslation();

  const [
    postApproveConsent,
    { data: approveResponse, error: approveConsentError, isLoading: isApprovingConsent },
  ] = useApproveConsentRequestMutation();

  const [
    postRejectConsent,
    { data: rejectResponse, error: rejectConsentError, isLoading: isRejectingConsent },
  ] = useRejectConsentRequestMutation();

  const isRequestApproved = isAccepted(request.consentRequestEvents);
  const isRequestRejected = isRevoked(request.consentRequestEvents);
  const isRequestExpired = isExpired(request.consentRequestEvents);

  const isActionButtonDisabled =
    isApprovingConsent ||
    isRejectingConsent ||
    approveResponse ||
    rejectResponse ||
    isRequestApproved ||
    isRequestRejected ||
    isRequestExpired;

  const approveConsent = async (): Promise<void> => {
    if (!isActionButtonDisabled && request) {
      try {
        await postApproveConsent({ requestId: request.id, language }).unwrap();
        logoutAndRedirect();
      } catch {
        // Error is already tracked via approveConsentError
      }
    }
  };

  const rejectConsent = async (): Promise<void> => {
    if (!isActionButtonDisabled && request) {
      try {
        await postRejectConsent({ requestId: request.id }).unwrap();
        logoutAndRedirect();
      } catch {
        // Error is already tracked via rejectConsentError
      }
    }
  };

  const logoutAndRedirect = (): void => {
    window.location.assign(
      `${import.meta.env.BASE_URL}accessmanagement/api/v1/consent/request/${request?.id}/logout`,
    );
  };

  return (
    <>
      <div className={cn(classes.consentBlock, classes.headerBlock)}>
        <DsHeading
          level={1}
          data-size='md'
        >
          {request.title[language]}
        </DsHeading>
        {isRequestExpired && !isRequestApproved && !isRequestRejected && (
          <ConsentStatus
            events={request.consentRequestEvents}
            isPoa={request.isPoa}
          />
        )}
      </div>
      <div className={classes.consentBlock}>
        <div className={classes.consentContent}>
          {isRequestApproved && (
            <DsAlert data-color='warning'>
              {request.isPoa
                ? t('consent_request.already_approved_poa')
                : t('consent_request.already_approved')}
            </DsAlert>
          )}
          {isRequestRejected && (
            <DsAlert data-color='warning'>
              {request.isPoa
                ? t('consent_request.already_rejected_poa')
                : t('consent_request.already_rejected')}
            </DsAlert>
          )}
          <DsParagraph className={classes.heading}>{request.heading[language]}</DsParagraph>
          {request.consentMessage && (
            <DsParagraph className={classes.consentMessage}>
              {request.consentMessage[language]}
            </DsParagraph>
          )}
          <DsParagraph className={classes.serviceIntro}>
            {request.serviceIntro[language]}
          </DsParagraph>
          <ConsentRights
            rights={request.rights}
            language={language}
          />
          <DsParagraph className={classes.expiration}>{request.expiration[language]}</DsParagraph>
          {request.handledBy && (
            <DsParagraph className={classes.handledBy}>{request.handledBy[language]}</DsParagraph>
          )}
          {approveConsentError && (
            <ConsentRequestError
              error={approveConsentError as { data: ProblemDetail }}
              defaultError={
                request.isPoa
                  ? t('consent_request.approve_error_poa')
                  : t('consent_request.approve_error')
              }
            />
          )}
          {rejectConsentError && (
            <ConsentRequestError
              error={rejectConsentError as { data: ProblemDetail }}
              defaultError={
                request.isPoa
                  ? t('consent_request.reject_error_poa')
                  : t('consent_request.reject_error')
              }
            />
          )}
          <div className={classes.buttonRow}>
            <DsButton
              variant='primary'
              aria-disabled={isActionButtonDisabled}
              loading={isApprovingConsent}
              onClick={approveConsent}
            >
              {request.isPoa
                ? t('consent_request.approve_poa')
                : t('consent_request.approve_consent')}
            </DsButton>
            <DsButton
              variant='tertiary'
              aria-disabled={isActionButtonDisabled}
              loading={isRejectingConsent}
              onClick={rejectConsent}
            >
              {request.isPoa
                ? t('consent_request.reject_poa')
                : t('consent_request.reject_consent')}
            </DsButton>
          </div>
        </div>
      </div>
    </>
  );
};
