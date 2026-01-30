import type { ReactElement } from 'react';
import React, { useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { DsAlert, DsButton, DsHeading, DsParagraph } from '@altinn/altinn-components';

import {
  useApproveConsentRequestMutation,
  useRejectConsentRequestMutation,
} from '@/rtk/features/consentApi';
import type { ConsentLanguage, ConsentRequest, ProblemDetail } from '../types';
import { isAccepted, isExpired, isRevoked } from '../utils';
import { ConsentRights } from '../components/ConsentRights/ConsentRights';
import classes from './ConsentRequestPage.module.css';
import { ConsentRequestError } from './ConsentRequestError';
import { ConsentStatus } from '../components/ConsentStatus/ConsentStatus';
import { ConsentPath } from '@/routes/paths';
import { getButtonIconSize } from '@/resources/utils';
import { ArrowLeftIcon } from '@navikt/aksel-icons';

interface ConsentRequestContentProps {
  request: ConsentRequest;
  language: keyof ConsentLanguage;
}
export const ConsentRequestContent = ({
  request,
  language,
}: ConsentRequestContentProps): ReactElement => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const skipLogout = searchParams.get('skiplogout');
  const backToPage = searchParams.get('backtopage');
  const navigate = useNavigate();
  const [isReceiptVisible, setIsReceiptVisible] = useState<boolean>(false);

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

  if (isReceiptVisible) {
    return (
      <ConsentReceipt
        isPoa={request.isPoa}
        requestId={request.id}
      />
    );
  }

  return (
    <>
      {backToPage && (
        <DsButton
          variant='tertiary'
          data-color='neutral'
          data-size='sm'
          className={classes.backButton}
          asChild
        >
          <Link
            to={
              backToPage === 'landingpage' ? '/' : `/${ConsentPath.Consent}/${ConsentPath.Active}`
            }
          >
            <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
            {t('common.back')}
          </Link>
        </DsButton>
      )}
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

interface ConsentReceiptProps {
  requestId: string;
  isPoa: boolean;
}
const ConsentReceipt = ({ isPoa, requestId }: ConsentReceiptProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={classes.consentReceipt}>
      <DsHeading
        level={1}
        data-size='md'
      >
        {isPoa
          ? t('consent_request.receipt_header_poa')
          : t('consent_request.receipt_header_consent')}
      </DsHeading>
      <DsParagraph>
        {isPoa ? t('consent_request.receipt_body_poa') : t('consent_request.receipt_body_consent')}
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
};
