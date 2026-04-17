import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import {
  useApproveConsentRequestMutation,
  useGetConsentRequestQuery,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import { PartyType } from '@/rtk/features/userInfoApi';
import type { ConsentRequest, ProblemDetail } from '../types';
import { getLanguage, isAccepted, isExpired, isRevoked, replaceStaticMetadata } from '../utils';
import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';
import { RequestPageLayout } from '../../common/RequestPageLayout/RequestPageLayout';
import { ConsentPath } from '@/routes/paths/consentPath';
import { ConsentStatus } from '../components/ConsentStatus/ConsentStatus';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';

export const ConsentRequestPage = () => {
  const { t, i18n } = useTranslation();

  useDocumentTitle(t('consent_request.page_title'));
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('id') ?? '';
  const language = getLanguage(i18n.language);
  const skipLogout = searchParams.get('skiplogout');
  const navigate = useNavigate();
  const [isReceiptVisible, setIsReceiptVisible] = useState<boolean>(false);

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

  const isRequestApproved = isAccepted(request?.consentRequestEvents ?? []);
  const isRequestRejected = isRevoked(request?.consentRequestEvents ?? []);
  const isRequestExpired = isExpired(request?.consentRequestEvents ?? []);

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
        redirectAfterAction(true);
      } catch {
        // Error is already tracked via approveConsentError
      }
    }
  };

  const rejectConsent = async (): Promise<void> => {
    if (!isActionButtonDisabled && request) {
      try {
        await postRejectConsent({ requestId: request.id }).unwrap();
        redirectAfterAction(false);
      } catch {
        // Error is already tracked via rejectConsentError
      }
    }
  };

  const redirectAfterAction = (isApproved: boolean): void => {
    if (skipLogout && isApproved) {
      setIsReceiptVisible(true);
    } else if (skipLogout && !isApproved) {
      navigate(`/${ConsentPath.Consent}/${ConsentPath.Active}`);
    } else {
      window.location.assign(
        `${import.meta.env.BASE_URL}accessmanagement/api/v1/consent/request/${request?.id}/logout`,
      );
    }
  };

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

  const account: { name: string; type: 'person' | 'company' } = {
    name: memoizedRequest?.fromParty.name ?? '',
    type: memoizedRequest?.fromParty.type === PartyType.Person ? 'person' : 'company',
  };

  let heading: React.ReactNode = null;
  let body: React.ReactNode = null;
  const error = loadRequestError ? (
    <ConsentRequestError
      error={loadRequestError as { data: ProblemDetail }}
      defaultError='consent_request.load_consent_error'
    />
  ) : null;

  if (isReceiptVisible) {
    heading = (
      <DsHeading
        level={1}
        data-size='md'
      >
        {memoizedRequest?.isPoa
          ? t('consent_request.receipt_header_poa')
          : t('consent_request.receipt_header_consent')}
      </DsHeading>
    );
    body = (
      <div className={classes.consentReceipt}>
        <DsParagraph>
          {memoizedRequest?.isPoa
            ? t('consent_request.receipt_body_poa')
            : t('consent_request.receipt_body_consent')}
        </DsParagraph>
        <DsButton
          onClick={() => {
            navigate(`/${ConsentPath.Consent}/${ConsentPath.Active}`, {
              state: { createdId: requestId },
            });
          }}
        >
          {t('consent_request.receipt_back')}
        </DsButton>
      </div>
    );
  } else if (memoizedRequest) {
    heading = (
      <>
        <DsHeading
          level={1}
          data-size='md'
        >
          {memoizedRequest.title[language]}
        </DsHeading>
        {isRequestExpired && !isRequestApproved && !isRequestRejected && (
          <ConsentStatus
            events={memoizedRequest.consentRequestEvents}
            isPoa={memoizedRequest.isPoa}
          />
        )}
      </>
    );
    body = (
      <div className={classes.consentContent}>
        {isRequestApproved && (
          <DsAlert data-color='warning'>
            {memoizedRequest?.isPoa
              ? t('consent_request.already_approved_poa')
              : t('consent_request.already_approved')}
          </DsAlert>
        )}
        {isRequestRejected && (
          <DsAlert data-color='warning'>
            {memoizedRequest?.isPoa
              ? t('consent_request.already_rejected_poa')
              : t('consent_request.already_rejected')}
          </DsAlert>
        )}
        <DsParagraph className={classes.heading}>{memoizedRequest.heading[language]}</DsParagraph>
        {memoizedRequest.consentMessage && (
          <DsParagraph className={classes.consentMessage}>
            {memoizedRequest.consentMessage[language]}
          </DsParagraph>
        )}
        <DsParagraph className={classes.serviceIntro}>
          {memoizedRequest.serviceIntro[language]}
        </DsParagraph>
        <ConsentRights
          rights={memoizedRequest.rights}
          language={language}
        />
        <DsParagraph className={classes.expiration}>
          {memoizedRequest.expiration[language]}
        </DsParagraph>
        {memoizedRequest.handledBy && (
          <DsParagraph className={classes.handledBy}>
            {memoizedRequest.handledBy[language]}
          </DsParagraph>
        )}
        {approveConsentError && (
          <ConsentRequestError
            error={approveConsentError as { data: ProblemDetail }}
            defaultError={
              memoizedRequest.isPoa
                ? t('consent_request.approve_error_poa')
                : t('consent_request.approve_error')
            }
          />
        )}
        {rejectConsentError && (
          <ConsentRequestError
            error={rejectConsentError as { data: ProblemDetail }}
            defaultError={
              memoizedRequest.isPoa
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
            {memoizedRequest.isPoa
              ? t('consent_request.approve_poa')
              : t('consent_request.approve_consent')}
          </DsButton>
          <DsButton
            variant='primary'
            aria-disabled={isActionButtonDisabled}
            loading={isRejectingConsent}
            onClick={rejectConsent}
          >
            {memoizedRequest.isPoa
              ? t('consent_request.reject_poa')
              : t('consent_request.reject_consent')}
          </DsButton>
        </div>
      </div>
    );
  }

  return (
    <RequestPageLayout
      account={account}
      isLoading={isLoadingRequest}
      error={error}
      heading={heading}
      body={body}
    />
  );
};
