import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsButton } from '@altinn/altinn-components';
import type { EnrichedResourceRequest } from '@/rtk/features/requestApi';
import { PartyRepresentationProvider } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { DraftRequestBody } from './DraftRequestBody';
import classes from './DraftRequestPage.module.css';

interface SingleDraftRequestViewProps {
  request: EnrichedResourceRequest;
  fromName: string;
  partyUuid: string;
  onConfirmRequest: () => void;
  onWithdrawRequest: () => void;
  isConfirmingRequest: boolean;
  isWithdrawingRequest: boolean;
  confirmRequestError: unknown;
  withdrawRequestError: unknown;
}

export const SingleDraftRequestView = ({
  request,
  fromName,
  partyUuid,
  onConfirmRequest,
  onWithdrawRequest,
  isConfirmingRequest,
  isWithdrawingRequest,
  confirmRequestError,
  withdrawRequestError,
}: SingleDraftRequestViewProps) => {
  const { t } = useTranslation();
  const isActionButtonDisabled = isConfirmingRequest || isWithdrawingRequest;

  return (
    <>
      {!!confirmRequestError && (
        <DsAlert data-color='danger'>{t('draft_request_page.approve_request_error')}</DsAlert>
      )}
      {!!withdrawRequestError && (
        <DsAlert data-color='danger'>{t('draft_request_page.withdraw_request_error')}</DsAlert>
      )}
      <PartyRepresentationProvider
        fromPartyUuid={partyUuid}
        actingPartyUuid={partyUuid}
        toPartyUuid={''}
      >
        <DraftRequestBody
          request={request}
          fromName={fromName}
        />
      </PartyRepresentationProvider>
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          aria-disabled={isActionButtonDisabled}
          loading={isConfirmingRequest}
          onClick={onConfirmRequest}
        >
          {t('draft_request_page.confirm_request')}
        </DsButton>
        <DsButton
          variant='primary'
          aria-disabled={isActionButtonDisabled}
          loading={isWithdrawingRequest}
          onClick={onWithdrawRequest}
        >
          {t('draft_request_page.withdraw_request')}
        </DsButton>
      </div>
    </>
  );
};
