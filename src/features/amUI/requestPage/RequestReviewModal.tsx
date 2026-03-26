import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import {
  BadgeProps,
  DsButton,
  DsDialog,
  DsHeading,
  DsLink,
  DsParagraph,
  List,
  ResourceListItem,
  Snackbar,
  SnackbarDuration,
  SnackbarProvider,
  useSnackbar,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  CheckmarkCircleIcon,
  ChevronRightIcon,
  CircleSlashIcon,
  ExclamationmarkTriangleFillIcon,
} from '@navikt/aksel-icons';
import { Request } from './types';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import {
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetEnrichedReceivedResourceRequestsQuery,
  type EnrichedRequestDto,
} from '@/rtk/features/requestApi';
import { ResourceList } from '../common/ResourceList/ResourceList';
import {
  useLazyDelegationCheckQuery,
  type ServiceResource,
  type DelegationCheckedRight,
} from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceInfo } from '../common/DelegationModal/SingleRights/ResourceInfo';
import classes from './RequestReviewModal.module.css';
import { DelegationAction } from '../common/DelegationModal/EditModal';

type ProcessedStatus = 'approved' | 'rejected';

interface RequestReviewModalProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModal = ({ request, onClose }: RequestReviewModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Open/close the dialog based on the request prop
  useEffect(() => {
    if (request) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [request]);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      closeButton={useTranslation().t('common.close')}
      onClose={onClose}
      className={classes.reviewModal}
    >
      <SnackbarProvider>
        <RequestReviewModalContent
          request={request}
          onClose={onClose}
        />
        <Snackbar />
      </SnackbarProvider>
    </DsDialog>
  );
};

const RequestReviewModalContent = ({ request, onClose }: RequestReviewModalProps) => {
  const { t } = useTranslation();
  const { actingParty } = usePartyRepresentation();
  const [approveRequest] = useApproveRequestMutation();
  const [rejectRequest] = useRejectRequestMutation();
  const [lazyDelegationCheck] = useLazyDelegationCheckQuery();
  const { openSnackbar } = useSnackbar();

  const {
    data: resourceRequests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
  } = useGetEnrichedReceivedResourceRequestsQuery(
    { party: actingParty?.partyUuid || '', from: request?.partyUuid || '', status: ['Pending'] },
    { skip: !actingParty?.partyUuid || !request?.partyUuid },
  );

  // Snapshot: capture first non-empty result, keep it stable while modal is open
  const [snapshotRequests, setSnapshotRequests] = useState<EnrichedRequestDto[]>([]);
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [processedRequests, setProcessedRequests] = useState<Record<string, ProcessedStatus>>({});
  const [delegationChecks, setDelegationChecks] = useState<
    Record<string, DelegationCheckedRight[]>
  >({});
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  // Reset state only when switching to a different party (not on every object reference change)
  const requestPartyUuid = request?.partyUuid;
  useEffect(() => {
    setSnapshotRequests([]);
    setSelectedResource(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
  }, [requestPartyUuid]);

  // Capture snapshot on first successful load (only when fetch has settled for current params)
  useEffect(() => {
    if (
      !isFetchingRequests &&
      resourceRequests &&
      resourceRequests.length > 0 &&
      snapshotRequests.length === 0
    ) {
      setSnapshotRequests(resourceRequests);
    }
  }, [resourceRequests, isFetchingRequests, snapshotRequests.length]);

  // Run delegation checks for all snapshotted resources
  useEffect(() => {
    if (snapshotRequests.length === 0) return;
    snapshotRequests.forEach(async (req) => {
      const resourceId = req.resource.identifier;
      if (delegationChecks[resourceId]) return;
      try {
        const result = await lazyDelegationCheck(resourceId).unwrap();
        setDelegationChecks((prev) => ({ ...prev, [resourceId]: result }));
      } catch {
        // If delegation check fails, treat as no data (no warning badge)
      }
    });
  }, [snapshotRequests]); // eslint-disable-line react-hooks/exhaustive-deps

  const cannotApprove = useCallback(
    (resourceId: string) => {
      const checks = delegationChecks[resourceId];
      return checks?.some((check) => check.result === false) ?? false;
    },
    [delegationChecks],
  );

  const handleClose = () => {
    setSnapshotRequests([]);
    setSelectedResource(null);
    setProcessedRequests({});
    setDelegationChecks({});
    setActionLoading(null);
    onClose();
  };

  const findRequestId = (resourceIdentifier: string): string | undefined =>
    snapshotRequests.find((r) => r.resource.identifier === resourceIdentifier)?.id;

  const handleApprove = async (resource: ServiceResource) => {
    const requestId = findRequestId(resource.identifier);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('approve');
    try {
      await approveRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      setProcessedRequests((prev) => ({ ...prev, [resource.identifier]: 'approved' }));
      setSelectedResource(null);
      openSnackbar({
        message: t('request_page.request_approved'),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch {
      openSnackbar({
        message: t('request_page.approve_failed'),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (resource: ServiceResource) => {
    const requestId = findRequestId(resource.identifier);
    if (!requestId || !actingParty?.partyUuid) return;
    setActionLoading('reject');
    try {
      await rejectRequest({ party: actingParty.partyUuid, id: requestId }).unwrap();
      setProcessedRequests((prev) => ({ ...prev, [resource.identifier]: 'rejected' }));
      setSelectedResource(null);
      openSnackbar({
        message: t('request_page.request_rejected'),
        color: 'success',
        duration: SnackbarDuration.normal,
      });
    } catch {
      openSnackbar({
        message: t('request_page.reject_failed'),
        color: 'danger',
        duration: SnackbarDuration.infinite,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelection = (resource: ServiceResource) => {
    const status = processedRequests[resource.identifier];
    if (status) return; // Don't allow selecting already processed requests
    setSelectedResource(resource);
  };

  const snapshotResources = snapshotRequests.map((r) => r.resource);

  return (
    <>
      {selectedResource ? (
        <RequestResourceDetail
          resource={selectedResource}
          toPartyName={request?.displayPartyName || ''}
          processedStatus={processedRequests[selectedResource.identifier]}
          actionLoading={actionLoading}
          onBack={() => setSelectedResource(null)}
          onApprove={() => handleApprove(selectedResource)}
          onReject={() => handleReject(selectedResource)}
          cannotApprove={cannotApprove(selectedResource.identifier)}
        />
      ) : (
        <div className={classes.reviewListView}>
          <DsHeading
            level={2}
            data-size='xs'
          >
            {t('request_page.review_modal_title', {
              fromPartyName: request?.displayPartyName,
            })}
          </DsHeading>
          <DsLink
            asChild
            className={classes.userLink}
          >
            <Link to={`/users/${request?.partyUuid}`}>
              {t('request_page.review_user_link', {
                name: request?.displayPartyName,
              })}
            </Link>
          </DsLink>
          <List>
            {isLoadingRequests || isFetchingRequests ? (
              <>
                {Array.from({ length: request?.numberOfRequests || 2 }).map((_, index) => (
                  <ResourceListItem
                    key={index}
                    id='1'
                    resourceName='xxxxxxxxxxxxxxxxxxxx'
                    ownerName='xxxxxxxxx xxxxxxxxxxx'
                    loading
                    as='div'
                    interactive={false}
                    shadow='none'
                  />
                ))}
              </>
            ) : (
              <ResourceList
                enableSearch={false}
                showDetails={false}
                interactive={true}
                resources={snapshotResources}
                onSelect={(resource) => handleSelection(resource)}
                renderControls={(resource) => {
                  const status = processedRequests[resource.identifier];
                  if (status === 'approved') {
                    return (
                      <span className={classes.processedStatus}>
                        <DsParagraph data-size='md'>
                          {t('request_page.review_approved')}
                        </DsParagraph>
                        <CheckmarkCircleIcon className={classes.approvedIcon} />
                      </span>
                    );
                  }
                  if (status === 'rejected') {
                    return (
                      <span className={classes.processedStatus}>
                        <DsParagraph data-size='md'>
                          {t('request_page.review_rejected')}
                        </DsParagraph>
                        <CircleSlashIcon className={classes.rejectedIcon} />
                      </span>
                    );
                  }
                  if (cannotApprove(resource.identifier)) {
                    return (
                      <span className={classes.processedStatus}>
                        <DsParagraph data-size='md'>{t('request_page.review_warning')}</DsParagraph>
                        <ExclamationmarkTriangleFillIcon className={classes.warningIcon} />
                      </span>
                    );
                  }
                  return <ChevronRightIcon className={classes.chevronIcon} />;
                }}
              />
            )}
          </List>

          <DsParagraph data-size='md'>{t('request_page.review_close_info')}</DsParagraph>
          <DsButton
            variant='secondary'
            onClick={handleClose}
            className={classes.closeButton}
          >
            {t('common.close')}
          </DsButton>
        </div>
      )}
    </>
  );
};

interface RequestResourceDetailProps {
  resource: ServiceResource;
  processedStatus?: ProcessedStatus;
  actionLoading: 'approve' | 'reject' | null;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  cannotApprove: boolean;
  toPartyName: string;
}

const RequestResourceDetail = ({
  resource,
  processedStatus,
  actionLoading,
  onBack,
  onApprove,
  onReject,
  cannotApprove,
  toPartyName,
}: RequestResourceDetailProps) => {
  const { t } = useTranslation();

  return (
    <>
      <DsButton
        variant='tertiary'
        className={classes.backButton}
        onClick={onBack}
      >
        <ArrowLeftIcon />
        {t('common.back')}
      </DsButton>
      <ResourceInfo
        resource={resource}
        toPartyName={toPartyName}
        availableActions={[DelegationAction.APPROVE]}
      />
      {!processedStatus && (
        <div className={classes.actionButtons}>
          <DsButton
            data-size='sm'
            onClick={onApprove}
            disabled={!!actionLoading || cannotApprove}
            loading={actionLoading === 'approve'}
          >
            {t('request_page.approve_request')}
          </DsButton>
          <DsButton
            data-size='sm'
            data-color='danger'
            variant='secondary'
            onClick={onReject}
            disabled={!!actionLoading}
            loading={actionLoading === 'reject'}
          >
            {t('request_page.reject_request')}
          </DsButton>
        </div>
      )}
    </>
  );
};
