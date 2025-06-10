import type { ChangeEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import {
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  Layout,
  RootProvider,
} from '@altinn/altinn-components';
import { CheckmarkIcon } from '@navikt/aksel-icons';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveConsentRequestMutation,
  useGetConsentRequestQuery,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import { getAltinnStartPageUrl } from '@/resources/utils/pathUtils';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import type { ConsentLanguage, ConsentRight, ProblemDetail } from '../types';
import { getLanguage, transformText } from '../utils';

import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';

export const ConsentRequestPage = () => {
  const { t, i18n } = useTranslation();

  useDocumentTitle(t('consent_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';

  const { data: userData } = useGetUserInfoQuery();
  const language = getLanguage(i18n.language);

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

  const [postApproveConsent, { error: approveConsentError, isLoading: isApprovingConsent }] =
    useApproveConsentRequestMutation();

  const [postRejectConsent, { error: rejectConsentError, isLoading: isRejectingConsent }] =
    useRejectConsentRequestMutation();

  const isActionButtonDisabled = isApprovingConsent || isRejectingConsent;

  const approveConsent = (): void => {
    if (!isActionButtonDisabled && request) {
      postApproveConsent({ requestId: request.id, language })
        .unwrap()
        .then(() => logoutAndRedirect());
    }
  };

  const rejectConsent = (): void => {
    if (!isActionButtonDisabled && request) {
      postRejectConsent({ requestId: request.id })
        .unwrap()
        .then(() => logoutAndRedirect());
    }
  };

  const logoutAndRedirect = (): void => {
    window.location.assign(`${import.meta.env.BASE_URL}/request/${request?.id}/logout`);
  };

  const onChangeLocale = (event: ChangeEvent<HTMLInputElement>) => {
    const newLocale = event.target.value;
    i18n.changeLanguage(newLocale);
    document.cookie = `selectedLanguage=${newLocale}; path=/; SameSite=Strict`;
  };

  if (isLoadingRequest) {
    return <DsSpinner aria-label={t('consent_request.loading_consent')} />;
  }

  if (loadRequestError) {
    return (
      <ConsentRequestError
        error={loadRequestError as { data: ProblemDetail }}
        defaultError='consent_request.load_consent_error'
      />
    );
  }

  return (
    <RootProvider>
      <Layout
        color={'neutral'}
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
          logo: { href: getAltinnStartPageUrl(), title: 'Altinn' },
          currentAccount: {
            name: request?.partyName ?? (userData?.name || ''),
            type: request?.partyName ? 'company' : 'person',
            id: '',
          },
        }}
      >
        {request && (
          <>
            <div className={classes.consentBlock}>
              <DsHeading
                level={1}
                data-size='md'
              >
                {request?.title?.[language] ?? ''}
              </DsHeading>
            </div>
            <div className={classes.consentBlock}>
              <DsParagraph>{request.heading[language]}</DsParagraph>
              <DsParagraph>{request.consentMessage[language]}</DsParagraph>
              <DsHeading
                level={2}
                data-size='2xs'
              >
                {request.serviceIntro[language]}
              </DsHeading>
              <div>
                {request.rights.map((right) => (
                  <ConsentRight
                    key={right.identifier}
                    language={language}
                    right={right}
                  />
                ))}
              </div>
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
          </>
        )}
      </Layout>
    </RootProvider>
  );
};

interface ConsentRightProps {
  right: ConsentRight;
  language: keyof ConsentLanguage;
}
const ConsentRight = ({ right, language }: ConsentRightProps) => {
  return (
    <div className={classes.consentRight}>
      <CheckmarkIcon className={classes.consentRightIcon} />
      <div>
        <DsHeading
          level={2}
          data-size='2xs'
        >
          {right.title[language]}
        </DsHeading>
        {transformText(right.consentTextHtml[language])}
      </div>
    </div>
  );
};
