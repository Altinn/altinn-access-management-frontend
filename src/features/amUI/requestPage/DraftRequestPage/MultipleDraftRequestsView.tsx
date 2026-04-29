import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DsAlert, DsButton, DsHeading } from '@altinn/altinn-components';
import { ArrowLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';

import type { EnrichedResourceRequest } from '@/rtk/features/requestApi';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { DraftRequestBody } from './DraftRequestBody';
import { useBatchRequestAction } from './useBatchRequestAction';

import classes from './DraftRequestPage.module.css';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

export type BatchActionType = 'confirm' | 'withdraw' | null;

interface MultipleDraftRequestsViewProps {
  requests: EnrichedResourceRequest[];
  fromName: string;
  onBatchComplete: (actionType: BatchActionType) => void;
}

export const MultipleDraftRequestsView = ({
  requests,
  fromName,
  onBatchComplete,
}: MultipleDraftRequestsViewProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedResourceRequest | null>(null);
  const { selfParty } = usePartyRepresentation();

  const {
    confirmAll: rawConfirmAll,
    withdrawAll: rawWithdrawAll,
    retryFailed: rawRetryFailed,
    isProcessing,
    actionType,
    failedRequests,
  } = useBatchRequestAction(requests);

  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();

  const resources = requests.map((r) => r.resource);

  const handleSelect = (resource: (typeof resources)[number]) => {
    const match = requests.find((r) => r.resource.identifier === resource.identifier);
    if (match) {
      setSelectedRequest(match);
    }
  };

  const confirmAll = async () => {
    const succeeded = await rawConfirmAll();
    if (succeeded) onBatchComplete('confirm');
  };

  const withdrawAll = async () => {
    const succeeded = await rawWithdrawAll();
    if (succeeded) onBatchComplete('withdraw');
  };

  const retryFailed = async () => {
    const succeeded = await rawRetryFailed();
    if (succeeded) onBatchComplete(actionType);
  };

  if (selectedRequest) {
    return (
      <>
        <DsButton
          ref={backButtonRef}
          variant='tertiary'
          className={classes.backButton}
          onClick={() => setSelectedRequest(null)}
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </DsButton>
        <DraftRequestBody
          request={selectedRequest}
          fromName={fromName}
        />
      </>
    );
  }

  return (
    <div className={classes.multipleDraftRequests}>
      {failedRequests.length > 0 && (
        <DsAlert data-color='danger'>
          {t('draft_request_page.batch_partial_error', {
            resources: failedRequests.map((f) => f.resourceName).join(', '),
          })}
        </DsAlert>
      )}
      <DsHeading
        data-size='sm'
        level={2}
        id='multiple-services-title'
      >
        <Trans
          i18nKey={'draft_request_page.multiple_services_title'}
          components={{ b: <strong /> }}
          values={{
            name:
              requests[0].from.id === selfParty?.partyUuid ? t('common.you_uppercase') : fromName,
          }}
        />
      </DsHeading>
      <ResourceList
        size='xs'
        border='dotted'
        enableSearch={false}
        showDetails={false}
        resources={
          failedRequests.length > 0
            ? resources.filter((r) => failedRequests.some((f) => f.resourceName === r.title))
            : resources
        }
        onSelect={handleSelect}
        ariaLabelledBy='multiple-services-title'
        renderControls={(resource) => (
          <div className={classes.seeDetails}>
            {t('common.see_details')} <ChevronRightIcon fontSize={'1.2rem'} />
          </div>
        )}
      />
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          aria-disabled={isProcessing}
          loading={isProcessing && actionType === 'confirm'}
          onClick={failedRequests.length > 0 ? retryFailed : confirmAll}
        >
          {t('draft_request_page.confirm_request')}
        </DsButton>
        <DsButton
          variant='primary'
          aria-disabled={isProcessing}
          loading={isProcessing && actionType === 'withdraw'}
          onClick={failedRequests.length > 0 ? retryFailed : withdrawAll}
        >
          {t('draft_request_page.withdraw_request')}
        </DsButton>
      </div>
    </div>
  );
};
