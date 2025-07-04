import type { ChangeEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  Layout,
  RootProvider,
} from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveConsentRequestMutation,
  useGetConsentRequestQuery,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import type { ProblemDetail } from '../types';
import { getLanguage } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';

export const ConsentRequestPage = () => {
  const { t, i18n } = useTranslation();

  useDocumentTitle(t('consent_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const language = getLanguage(i18n.language);

  const { data: userData } = useGetUserInfoQuery();

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

  const [
    postApproveConsent,
    { data: approveResponse, error: approveConsentError, isLoading: isApprovingConsent },
  ] = useApproveConsentRequestMutation();

  const [
    postRejectConsent,
    { data: rejectResponse, error: rejectConsentError, isLoading: isRejectingConsent },
  ] = useRejectConsentRequestMutation();

  const isActionButtonDisabled =
    isApprovingConsent || isRejectingConsent || approveResponse || rejectResponse;

  const isRequestApproved = request?.consentRequestEvents.some(
    (event) => event.eventType === 'Accepted',
  );
  const isRequestRejected = request?.consentRequestEvents.some(
    (event) => event.eventType === 'Rejected',
  );

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

  const onChangeLocale = (event: ChangeEvent<HTMLInputElement>) => {
    const newLocale = event.target.value;
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

  return (
    <RootProvider>
      <Layout
        color='neutral'
        theme='subtle'
        header={{
          menu: {
            items: [],
          },
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onChange: onChangeLocale,
          },
          logo: {
            href: getAltinnStartPageUrl(),
            title: 'Altinn',
          },
          currentAccount: {
            name: request?.fromPartyName ?? (userData?.name || ''),
            type: request?.fromPartyName ? 'company' : 'person',
            id: '',
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
        {request && (
          <>
            <div className={classes.consentBlock}>
              <DsHeading
                level={1}
                data-size='md'
                className={classes.topHeader}
              >
                {request.title[language]}
              </DsHeading>
            </div>
            <div className={classes.consentBlock}>
              <div className={classes.consentContent}>
                <DsParagraph className={classes.boldText}>{request.heading[language]}</DsParagraph>
                <DsParagraph>{request.consentMessage[language]}</DsParagraph>
                <DsHeading
                  level={2}
                  data-size='2xs'
                >
                  {request.serviceIntro[language]}
                </DsHeading>
                <ConsentRights
                  rights={request.rights}
                  language={language}
                />
                <DsParagraph className={classes.expiration}>
                  {request.expiration[language]}
                </DsParagraph>
                {request.handledBy && <DsParagraph>{request.handledBy[language]}</DsParagraph>}
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
                {isRequestApproved && (
                  <DsAlert data-color='info'>
                    {request.isPoa
                      ? t('consent_request.already_approved_poa')
                      : t('consent_request.already_approved')}
                  </DsAlert>
                )}
                {isRequestRejected && (
                  <DsAlert data-color='info'>
                    {request.isPoa
                      ? t('consent_request.already_rejected_poa')
                      : t('consent_request.already_rejected')}
                  </DsAlert>
                )}
                {!isRequestApproved && !isRequestRejected && (
                  <div className={classes.buttonRow}>
                    <DsButton
                      variant='primary'
                      aria-disabled={isActionButtonDisabled}
                      loading={isApprovingConsent || approveResponse}
                      onClick={approveConsent}
                    >
                      {request.isPoa
                        ? t('consent_request.approve_poa')
                        : t('consent_request.approve_consent')}
                    </DsButton>
                    <DsButton
                      variant='tertiary'
                      aria-disabled={isActionButtonDisabled}
                      loading={isRejectingConsent || rejectResponse}
                      onClick={rejectConsent}
                    >
                      {request.isPoa
                        ? t('consent_request.reject_poa')
                        : t('consent_request.reject_consent')}
                    </DsButton>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Layout>
    </RootProvider>
  );
};
