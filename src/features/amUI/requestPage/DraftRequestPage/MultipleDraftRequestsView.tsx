import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  AccessPackageListItem,
  DsAlert,
  DsButton,
  DsHeading,
  List,
} from '@altinn/altinn-components';
import { ArrowLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';

import {
  isEnrichedPackageRequest,
  type EnrichedPackageRequest,
  type EnrichedRequest,
  type EnrichedResourceRequest,
} from '@/rtk/features/requestApi';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { DraftRequestBody } from './DraftRequestBody';
import { useBatchRequestAction } from './useBatchRequestAction';

import classes from './DraftRequestPage.module.css';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

export type BatchActionType = 'confirm' | 'withdraw' | null;

interface MultipleDraftRequestsViewProps {
  requests: EnrichedRequest[];
  fromName: string;
  onBatchComplete: (actionType: BatchActionType) => void;
}

export const MultipleDraftRequestsView = ({
  requests,
  fromName,
  onBatchComplete,
}: MultipleDraftRequestsViewProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedRequest | null>(null);
  const { selfParty } = usePartyRepresentation();

  const {
    confirmAll: rawConfirmAll,
    withdrawAll: rawWithdrawAll,
    isProcessing,
    actionType,
    failedRequests,
  } = useBatchRequestAction(requests);

  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();

  // While there are failures, only the failed requests are shown so the user can retry them
  const failedRequestIds = new Set(failedRequests.map((f) => f.request.id));
  const visibleRequests =
    failedRequests.length > 0 ? requests.filter((r) => failedRequestIds.has(r.id)) : requests;

  const packageRequests = visibleRequests.filter(isEnrichedPackageRequest);
  const resourceRequests = visibleRequests.filter(
    (r): r is EnrichedResourceRequest => !isEnrichedPackageRequest(r),
  );

  const handleSelectResource = (resource: EnrichedResourceRequest['resource']) => {
    const match = resourceRequests.find((r) => r.resource.identifier === resource.identifier);
    if (match) {
      setSelectedRequest(match);
    }
  };

  const confirmAll = async () => {
    if (isProcessing) return;
    const succeeded = await rawConfirmAll();
    if (succeeded) onBatchComplete('confirm');
  };

  const withdrawAll = async () => {
    if (isProcessing) return;
    const succeeded = await rawWithdrawAll();
    if (succeeded) onBatchComplete('withdraw');
  };

  const displayFromName =
    requests[0].from.id === selfParty?.partyUuid ? t('common.you_uppercase') : fromName;

  if (selectedRequest) {
    return (
      <>
        <DsButton
          ref={backButtonRef}
          variant='tertiary'
          className={classes.backButton}
          onClick={() => setSelectedRequest(null)}
        >
          <ArrowLeftIcon aria-hidden='true' />
          {t('common.back')}
        </DsButton>
        <DraftRequestBody
          request={selectedRequest}
          fromName={fromName}
        />
      </>
    );
  }

  const seeDetailsControls = (
    <div className={classes.seeDetails}>
      {t('common.see_details')}{' '}
      <ChevronRightIcon
        fontSize={'1.2rem'}
        aria-hidden='true'
      />
    </div>
  );

  return (
    <div className={classes.multipleDraftRequests}>
      <div aria-live='polite'>
        {failedRequests.length > 0 && (
          <DsAlert data-color='danger'>
            {t('draft_request_page.batch_partial_error', {
              resources: failedRequests.map((f) => f.name).join(', '),
            })}
          </DsAlert>
        )}
      </div>
      {packageRequests.length > 0 && (
        <>
          <DsHeading
            data-size='sm'
            level={2}
            id='multiple-packages-title'
          >
            <Trans
              i18nKey={'draft_request_page.multiple_packages_title'}
              components={{ b: <strong /> }}
              values={{ name: displayFromName }}
            />
          </DsHeading>
          <List aria-labelledby='multiple-packages-title'>
            {packageRequests.map((packageRequest) => (
              <DraftPackageRow
                key={packageRequest.id}
                request={packageRequest}
                controls={seeDetailsControls}
                onClick={() => setSelectedRequest(packageRequest)}
              />
            ))}
          </List>
        </>
      )}
      {resourceRequests.length > 0 && (
        <>
          <DsHeading
            data-size='sm'
            level={2}
            id='multiple-services-title'
          >
            <Trans
              i18nKey={'draft_request_page.multiple_services_title'}
              components={{ b: <strong /> }}
              values={{ name: displayFromName }}
            />
          </DsHeading>
          <ResourceList
            size='xs'
            border='dotted'
            enableSearch={false}
            showDetails={false}
            resources={resourceRequests.map((r) => r.resource)}
            onSelect={handleSelectResource}
            ariaLabelledBy='multiple-services-title'
            renderControls={() => seeDetailsControls}
          />
        </>
      )}
      <div className={classes.buttonRow}>
        <DsButton
          variant='primary'
          aria-disabled={isProcessing}
          loading={isProcessing && actionType === 'confirm'}
          onClick={confirmAll}
        >
          {t('draft_request_page.confirm_request')}
        </DsButton>
        <DsButton
          variant='primary'
          aria-disabled={isProcessing}
          loading={isProcessing && actionType === 'withdraw'}
          onClick={withdrawAll}
        >
          {t('draft_request_page.withdraw_request')}
        </DsButton>
      </div>
    </div>
  );
};

interface DraftPackageRowProps {
  request: EnrichedPackageRequest;
  controls: React.ReactNode;
  onClick: () => void;
}

const DraftPackageRow = ({ request, controls, onClick }: DraftPackageRowProps) => {
  const { t } = useTranslation();
  return (
    <AccessPackageListItem
      id={request.package.id}
      name={request.package.name}
      description={t('access_packages.package_number_of_resources', {
        count: request.package.resources.length,
      })}
      interactive
      size='xs'
      border='dotted'
      controls={controls}
      onClick={onClick}
    />
  );
};
