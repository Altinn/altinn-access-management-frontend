import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import {
  useConfirmRequestMutation,
  useGetEnrichedDraftRequestQuery,
  useWithdrawRequestMutation,
  type EnrichedResourceRequest,
} from '@/rtk/features/requestApi';
import { useSearchParams } from 'react-router';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { RequestPageLayout } from '../../common/RequestPageLayout/RequestPageLayout';
import { PartyRepresentationProvider } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { useMultipleDraftRequests } from './useMultipleDraftRequests';
import { MultipleDraftRequestsView, type BatchActionType } from './MultipleDraftRequestsView';
import { DraftRequestHeader } from './DraftRequestHeader';
import { RequestReceiptBody } from './RequestReceiptBody';
import { SingleDraftRequestView } from './SingleDraftRequestView';

export const DraftRequestPage = () => {
  const { t } = useTranslation();

  useDocumentTitle(t('draft_request_page.page_title'));
  const [searchParams] = useSearchParams();
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const requestIds = Array.from(new Set(searchParams.getAll('requestId'))); // Duplicate IDs are ignored
  const isMultiMode = requestIds.length > 1;
  const [batchCompleteAction, setBatchCompleteAction] = useState<BatchActionType>(null);

  const onBatchComplete: (actionType: BatchActionType) => void = useCallback((actionType) => {
    setBatchCompleteAction(actionType);
  }, []);

  const singleRequestId = requestIds[0] ?? '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetEnrichedDraftRequestQuery(
    { id: singleRequestId },
    { skip: !singleRequestId || isMultiMode },
  );

  const stableMultiIds = useMemo(
    () => (isMultiMode ? requestIds : []),
    [isMultiMode, requestIds.join(',')],
  );
  const {
    requests: multiRequests,
    isLoading: isLoadingMultiRequests,
    loadError: multiLoadError,
  } = useMultipleDraftRequests(stableMultiIds);

  const representativeRequest: EnrichedResourceRequest | undefined = isMultiMode
    ? multiRequests[0]
    : request;

  const fromError =
    isMultiMode && multiRequests.some((r) => r.from.id !== representativeRequest?.from.id);

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

  // Normalise the completed action across single and multi modes
  const receiptAction: 'confirm' | 'withdraw' | null = isMultiMode
    ? batchCompleteAction
    : confirmResponse
      ? 'confirm'
      : withdrawResponse
        ? 'withdraw'
        : null;

  let heading: React.ReactNode = null;
  let body: React.ReactNode = null;
  let error: React.ReactNode = null;

  if (receiptAction) {
    const isConfirm = receiptAction === 'confirm';
    heading = (
      <DraftRequestHeader
        headerTextKey={
          isConfirm ? 'draft_request_page.request_approved' : 'draft_request_page.request_withdrawn'
        }
        toName={toName}
      />
    );
    body = (
      <RequestReceiptBody
        bodyTextKey={
          isConfirm
            ? 'draft_request_page.request_approved_info'
            : 'draft_request_page.request_withdrawn_info'
        }
        toName={toName}
      />
    );
  } else if (!isInitialLoad && representativeRequest) {
    heading = (
      <>
        <DraftRequestHeader
          headerTextKey='draft_request_page.heading'
          toName={toName}
        />
        <DsParagraph>
          <Trans
            i18nKey={
              partyUuid === representativeRequest.from.id
                ? 'draft_request_page.intro_person'
                : 'draft_request_page.intro_company'
            }
            components={{ b: <strong /> }}
            values={{ to_name: toName, from_name: fromName }}
          />
        </DsParagraph>
      </>
    );

    if (isMultiMode && multiRequests.length > 0) {
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
    } else if (request) {
      body = (
        <SingleDraftRequestView
          request={request}
          fromName={fromName}
          partyUuid={partyUuid}
          onConfirmRequest={onConfirmRequest}
          onWithdrawRequest={onWithdrawRequest}
          isConfirmingRequest={isConfirmingRequest}
          isWithdrawingRequest={isWithdrawingRequest}
          confirmRequestError={confirmRequestError}
          withdrawRequestError={withdrawRequestError}
        />
      );
    }
  }

  if (isMultiMode) {
    if (multiLoadError || fromError) {
      error = <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>;
      body = null;
    }
  } else {
    if (!singleRequestId) {
      error = <DsAlert data-color='warning'>{t('draft_request_page.missing_request_id')}</DsAlert>;
      body = null;
    } else if (loadRequestError) {
      error = <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>;
      body = null;
    }
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
