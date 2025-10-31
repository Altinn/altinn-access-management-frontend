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
  Layout,
  RootProvider,
} from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveConsentRequestMutation,
  useGetConsentRequestQuery,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import { getAltinnStartPageUrl, getLogoutUrl } from '@/resources/utils/pathUtils';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import type { ConsentLanguage, ConsentRequest, ProblemDetail } from '../types';
import { getLanguage, isAccepted, isExpired, isRevoked, replaceStaticMetadata } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';
import { ConsentStatus } from '../components/ConsentStatus/ConsentStatus';

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

  const onChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

  const account: { name: string; type: 'person' | 'company' } = {
    name: memoizedRequest?.fromPartyName ?? '',
    type: memoizedRequest?.fromPartyName === userData?.name ? 'person' : 'company',
  };

  return (
    <RootProvider>
      <Layout
        color='neutral'
        theme='subtle'
        header={{
          locale: {
            title: t('header.locale_title'),
            options: [
              { label: 'Norsk (bokmål)', value: 'no_nb', checked: i18n.language === 'no_nb' },
              { label: 'Norsk (nynorsk)', value: 'no_nn', checked: i18n.language === 'no_nn' },
              { label: 'English', value: 'en', checked: i18n.language === 'en' },
            ],
            onSelect: onChangeLocale,
          },
          logo: {
            href: getAltinnStartPageUrl(),
            title: 'Altinn',
          },
          currentAccount: {
            ...account,
            id: '',
            icon: account,
          },
          globalMenu: {
            logoutButton: {
              label: t('header.log_out'),
              onClick: () => {
                const logoutUrl = getLogoutUrl();
                window.location.assign(logoutUrl);
              },
            },
            menuLabel: t('header.menu-label'),
            backLabel: t('header.back-label'),
            changeLabel: t('header.change-label'),
            menu: {
              items: [{ groupId: 'current-user', hidden: true }],
              groups: {
                'current-user': {
                  title: t('header.logged_in_as_name', {
                    name: userData?.name || '',
                  }),
                },
              },
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
            language={language}
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
