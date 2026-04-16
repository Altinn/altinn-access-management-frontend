import React, { useEffect } from 'react';
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
} from '@/rtk/features/requestApi';
import classes from './DraftRequestPage.module.css';
import { PartyRepresentationProvider } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useSearchParams } from 'react-router';
import { redirectToChangeReporteeAndRedirect } from '@/resources/utils/changeReporteeUtils';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { RequestPageLayout } from '../../common/RequestPageLayout/RequestPageLayout';
import { DraftRequestBody } from './DraftRequestBody';

export const DraftRequestPage = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const partyUuid = getCookie('AltinnPartyUuid') || '';
  const requestId = searchParams.get('requestId') ?? '';

  const {
    data: request,
    isLoading: isLoadingRequest,
    error: loadRequestError,
  } = useGetEnrichedDraftRequestQuery(
    { id: requestId },
    {
      skip: !requestId,
    },
  );

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
      confirmRequest({ party: request?.from.id, id: request.id });
    }
  };

  const onWithdrawRequest = () => {
    if (!isActionButtonDisabled && request) {
      withdrawRequest({ party: request.from.id, id: request.id });
    }
  };

  useEffect(() => {
    // If the request is for a different user than the one currently logged in, redirect to the correct reportee
    if (request?.from.id && request.from.id !== partyUuid) {
      redirectToChangeReporteeAndRedirect(request?.from.id, window.location.href);
    }
  }, [request, partyUuid]);

  const toName = formatDisplayName({
    fullName: request?.to.name ?? '',
    type: request?.to.type === 'Person' ? 'person' : 'company',
  });
  const fromName = formatDisplayName({
    fullName: request?.from.name ?? '',
    type: request?.from.type === 'Person' ? 'person' : 'company',
  });

  let heading: React.ReactNode = null;
  let body: React.ReactNode = null;
  let error: React.ReactNode = null;

  if (confirmResponse) {
    heading = (
      <DraftRequestHeader
        headerTextKey='draft_request_page.request_approved'
        toName={toName}
      />
    );
    body = (
      <RequestReceiptBody
        bodyTextKey='draft_request_page.request_approved_info'
        toName={toName}
      />
    );
  } else if (withdrawResponse) {
    heading = (
      <DraftRequestHeader
        headerTextKey='draft_request_page.request_withdrawn'
        toName={toName}
      />
    );
    body = (
      <RequestReceiptBody
        bodyTextKey='draft_request_page.request_withdrawn_info'
        toName={toName}
      />
    );
  } else if (request) {
    heading = (
      <>
        <DraftRequestHeader
          headerTextKey='draft_request_page.heading'
          toName={toName}
        />
        <DsParagraph>
          <Trans
            i18nKey={
              partyUuid === request?.from.id
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
        {confirmRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.approve_request_error')}</DsAlert>
        )}
        {withdrawRequestError && (
          <DsAlert data-color='danger'>{t('draft_request_page.withdraw_request_error')}</DsAlert>
        )}
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

  if (!requestId) {
    error = <DsAlert data-color='warning'>{t('draft_request_page.missing_request_id')}</DsAlert>;
  } else if (loadRequestError) {
    error = <DsAlert data-color='danger'>{t('draft_request_page.load_request_error')}</DsAlert>;
  }

  return (
    <RequestPageLayout
      account={{
        name: request?.from.name ?? '',
        type: request?.from.type === 'Person' ? 'person' : 'company',
      }}
      error={error}
      isLoading={isLoadingRequest}
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
