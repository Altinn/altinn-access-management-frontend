import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import {
  useConfirmRequestMutation,
  useGetEnrichedDraftRequestQuery,
  useWithdrawRequestMutation,
  type EnrichedResourceRequest,
} from '@/rtk/features/requestApi';
import classes from './DraftRequestPage.module.css';
import { PartyRepresentationProvider } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useSearchParams } from 'react-router';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { RequestPageLayout } from '../../common/RequestPageLayout/RequestPageLayout';
import { DraftRequestBody } from './DraftRequestBody';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useMultipleDraftRequests } from './useMultipleDraftRequests';
import { MultipleDraftRequestsView, type BatchActionType } from './MultipleDraftRequestsView';

export const DraftRequestPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('draft_request_page.page_title'));
  const [searchParams] = useSearchParams();
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const requestIds = searchParams.getAll('requestId');
  const isMultiMode = requestIds.length > 1;
  const [batchCompleteAction, setBatchCompleteAction] = useState<BatchActionType>(null);
  let fromError = false;

  const onBatchComplete: (actionType: BatchActionType) => void = useCallback((actionType) => {
    setBatchCompleteAction(actionType);
  }, []);

  // Single mode: use the first (only) ID
  const singleRequestId = requestIds[0] ?? '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetEnrichedDraftRequestQuery(
    { id: singleRequestId },
    {
      skip: !singleRequestId || isMultiMode,
    },
  );

  // Multi mode: fetch all request IDs
  const stableMultiIds = useMemo(
    () => (isMultiMode ? requestIds : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMultiMode, requestIds.join(',')],
  );
  const {
    requests: multiRequests,
    isLoading: isLoadingMultiRequests,
    loadError: multiLoadError,
  } = useMultipleDraftRequests(stableMultiIds);

  // For multi mode, derive a representative request for account/heading info
  const representativeRequest: EnrichedResourceRequest | undefined = isMultiMode
    ? multiRequests[0]
    : request;

  if (isMultiMode && multiRequests.some((r) => r.from.id !== representativeRequest?.from.id)) {
    // If the requests are from different users, we can't show them together - show an error instead
    fromError = true;
  }

  const [
    confirmRequest,
    { data: confirmResponse, error: confirmRequestError, isLoading: isConfirmingRequest },
  ] = useConfirmRequestMutation();

  const [
    withdrawRequest,
    { data: withdrawResponse, error: withdrawRequestError, isLoading: isWithdrawingRequest },
  ] = useWithdrawRequestMutation();

  const isActionButtonDisabled = isConfirmingRequest || isWithdrawingRequest;
  const onConfirmRequest = () => {
    if (!isActionButtonDisabled && request) {
      confirmRequest({ party: request.from.id, id: request.id });
    }
  };

  const onWithdrawRequest = () => {
    if (!isActionButtonDisabled && request) {
      withdrawRequest({ party: request.from.id, id: request.id });
    }
  };

  useEffect(() => {
    // If the request is for a different user than the one currently logged in, redirect to the correct reportee
    const fromId = representativeRequest?.from.id;
    if (fromId && fromId !== partyUuid) {
      redirectToChangeReporteeAndRedirect(fromId, window.location.href);
    }
  }, [representativeRequest, partyUuid]);

  const isInitialLoad = isMultiMode
    ? isLoadingMultiRequests || !!(multiRequests[0] && multiRequests[0].from.id !== partyUuid)
    : isLoadingRequest || !!(request && request.from.id !== partyUuid);

  const toName = formatDisplayName({
    fullName: representativeRequest?.to.name ?? '',
    type: representativeRequest?.to.type === 'Person' ? 'person' : 'company',
  });
  const fromName = formatDisplayName({
    fullName: representativeRequest?.from.name ?? '',
    type: representativeRequest?.from.type === 'Person' ? 'person' : 'company',
  });

  let heading: React.ReactNode = null;
  let body: React.ReactNode = null;
  let error: React.ReactNode = null;

  const generateHeading = (headerTextKey: string) => (
    <DraftRequestHeader
      headerTextKey={headerTextKey}
      toName={toName}
    />
  );
  const generateReceiptBody = (bodyTextKey: string) => (
    <RequestReceiptBody
      bodyTextKey={bodyTextKey}
      toName={toName}
    />
  );

  if (isMultiMode) {
    // Multi-request mode
    if (batchCompleteAction === 'confirm') {
      heading = generateHeading('draft_request_page.request_approved');
      body = generateReceiptBody('draft_request_page.request_approved_info');
    } else if (batchCompleteAction === 'withdraw') {
      heading = generateHeading('draft_request_page.request_withdrawn');
      body = generateReceiptBody('draft_request_page.request_withdrawn_info');
    } else if (!isInitialLoad && multiRequests.length > 0) {
      heading = (
        <>
          {generateHeading('draft_request_page.heading')}
          <DsParagraph>
            <Trans
              i18nKey={
                partyUuid === multiRequests[0].from.id
                  ? 'draft_request_page.intro_person'
                  : 'draft_request_page.intro_company'
              }
              components={{ b: <strong /> }}
              values={{ to_name: toName, from_name: fromName }}
            />
          </DsParagraph>
        </>
      );

      body = (
        <PartyRepresentationProvider
          fromPartyUuid={partyUuid}
          actingPartyUuid={partyUuid}
          toPartyUuid={''}
        >
          <MultipleDraftRequestsView
            requests={multiRequests}
            fromName={fromName}
            onBatchComplete={onBatchComplete}
          />
        </PartyRepresentationProvider>
      );
    }

    if (multiLoadError && fromError) {
      error = <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>;
      body = null; // Don't show the page if there was an error loading
    }
  } else {
    // Single-request mode
    if (confirmResponse) {
      heading = generateHeading('draft_request_page.request_approved');
      body = generateReceiptBody('draft_request_page.request_approved_info');
    } else if (withdrawResponse) {
      heading = generateHeading('draft_request_page.request_withdrawn');
      body = generateReceiptBody('draft_request_page.request_withdrawn_info');
    } else if (request && !isInitialLoad) {
      heading = (
        <>
          {generateHeading('draft_request_page.heading')}
          <DsParagraph>
            <Trans
              i18nKey={
                partyUuid === request.from.id
                  ? 'draft_request_page.intro_person'
                  : 'draft_request_page.intro_company'
              }
              components={{ b: <strong /> }}
              values={{ to_name: toName, from_name: fromName }}
            />
          </DsParagraph>
        </>
      );

      body = (
        <>
          {confirmRequestError && (
            <DsAlert data-color='danger'>{t('draft_request_page.approve_request_error')}</DsAlert>
          )}
          {withdrawRequestError && (
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
              aria-disabled={isConfirmingRequest || isWithdrawingRequest}
              loading={isConfirmingRequest}
              onClick={onConfirmRequest}
            >
              {t('draft_request_page.confirm_request')}
            </DsButton>
            <DsButton
              variant='primary'
              aria-disabled={isConfirmingRequest || isWithdrawingRequest}
              loading={isWithdrawingRequest}
              onClick={onWithdrawRequest}
            >
              {t('draft_request_page.withdraw_request')}
            </DsButton>
          </div>
        </>
      );
    }

    if (!singleRequestId) {
      error = <DsAlert data-color='warning'>{t('draft_request_page.missing_request_id')}</DsAlert>;
    } else if (loadRequestError) {
      error = <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>;
      body = null; // Don't show the page if there was an error loading
    }
  }

  if (requestIds.length === 0) {
    error = <DsAlert data-color='warning'>{t('draft_request_page.missing_request_id')}</DsAlert>;
    body = null; // Don't show the page if there was an error loading
  }

  return (
    <RequestPageLayout
      account={{
        name: representativeRequest?.from.name ?? '',
        type: representativeRequest?.from.type === 'Person' ? 'person' : 'company',
      }}
      error={error}
      isLoading={isInitialLoad}
      heading={heading}
      body={body}
    />
  );
};

interface DraftRequestHeaderProps {
  headerTextKey: string;
  toName: string;
}

const DraftRequestHeader = ({ headerTextKey, toName }: DraftRequestHeaderProps) => {
  return (
    <DsHeading
      level={1}
      data-size='md'
    >
      <Trans
        i18nKey={headerTextKey}
        components={{ b: <strong /> }}
        values={{ to_name: toName }}
      />
    </DsHeading>
  );
};

interface RequestReceiptBodyProps {
  bodyTextKey: string;
  toName: string;
}
const RequestReceiptBody = ({ bodyTextKey, toName }: RequestReceiptBodyProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DsParagraph>
        <Trans
          i18nKey={bodyTextKey}
          components={{ b: <strong /> }}
          values={{ to_name: toName }}
        />
      </DsParagraph>
      <DsParagraph className={classes.closeWindowInfo}>
        {t('draft_request_page.close_window_info')}
      </DsParagraph>
    </>
  );
};
