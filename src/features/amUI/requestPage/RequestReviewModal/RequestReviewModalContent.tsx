import { type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import {
  AccessPackageListItem,
  DsButton,
  DsHeading,
  DsLink,
  DsParagraph,
  List,
  ResourceListItem,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import {
  CheckmarkCircleIcon,
  ChevronRightIcon,
  CircleSlashIcon,
  ExclamationmarkTriangleFillIcon,
} from '@navikt/aksel-icons';
import type { Request } from '../types';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { RequestResourceDetail } from './RequestResourceDetail';
import { useRequestReview } from './useRequestReview';
import classes from './RequestReviewModal.module.css';
import { amUIPath } from '@/routes/paths';
import { RequestPackageDetail } from './RequestPackageDetail';
import { useRestoreFocus, useRestoreFocusTarget } from '../../common/RestoreFocus';
import { TwoStepDialog } from '../../common/TwoStepDialog';

interface RequestReviewModalContentProps {
  modalRef: RefObject<HTMLDialogElement | null>;
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModalContent = ({
  modalRef,
  request,
  onClose,
}: RequestReviewModalContentProps) => {
  const { t } = useTranslation();
  const restoreFocus = useRestoreFocus();

  const {
    isLoadingRequests,
    isFetchingRequests,
    snapshotResources,
    snapshotPackages,
    selectedResource,
    selectedPackage,
    resetSelection,
    processedRequests,
    actionLoading,
    bulkActionLoading,
    cannotApprove,
    hasPendingRequests,
    hasApprovableRequests,
    handleClose,
    handleApprove,
    handleReject,
    handleApproveAll,
    handleRejectAll,
    handleSelection,
    // close() instead of onClose ensures native focus restore runs before onClose fires
  } = useRequestReview(request, () => modalRef.current?.close());

  const isDetailView = !!selectedResource || !!selectedPackage;

  const handleBack = () => {
    const focusTargetId = selectedResource?.identifier ?? selectedPackage?.id;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    resetSelection();
  };

  const itemControls = ({ resourceId, packageId }: { resourceId?: string; packageId?: string }) => {
    const id = resourceId ?? packageId ?? '';
    const status = processedRequests[id]?.status;
    const chevron = () => (
      <ChevronRightIcon
        className={classes.chevronIcon}
        aria-hidden='true'
      />
    );
    if (status === 'approved') {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_approved')}</DsParagraph>
          <CheckmarkCircleIcon
            className={classes.approvedIcon}
            aria-hidden='true'
          />
          {chevron()}
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_rejected')}</DsParagraph>
          <CircleSlashIcon
            className={classes.rejectedIcon}
            aria-hidden='true'
          />
          {chevron()}
        </span>
      );
    }
    if (cannotApprove({ resourceId, packageId })) {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_warning')}</DsParagraph>
          <ExclamationmarkTriangleFillIcon
            className={classes.warningIcon}
            aria-hidden='true'
          />
          {chevron()}
        </span>
      );
    }
    return chevron();
  };

  let content: ReactNode = null;
  if (request !== null) {
    if (selectedResource) {
      const processed = processedRequests[selectedResource.identifier];
      content = (
        <RequestResourceDetail
          resource={selectedResource}
          toPartyName={request.displayPartyName || ''}
          processedStatus={processed?.status}
          handledAt={processed?.handledAt}
          actionLoading={actionLoading}
          onApprove={() => handleApprove({ resourceId: selectedResource.identifier })}
          onReject={() => handleReject({ resourceId: selectedResource.identifier })}
          cannotApprove={cannotApprove({ resourceId: selectedResource.identifier })}
        />
      );
    } else if (selectedPackage) {
      const processed = processedRequests[selectedPackage.id];
      content = (
        <RequestPackageDetail
          pkg={selectedPackage}
          toPartyName={request.displayPartyName || ''}
          processedStatus={processed?.status}
          handledAt={processed?.handledAt}
          actionLoading={actionLoading}
          onApprove={() => handleApprove({ packageId: selectedPackage.id })}
          onReject={() => handleReject({ packageId: selectedPackage.id })}
          cannotApprove={cannotApprove({ packageId: selectedPackage.id })}
        />
      );
    } else {
      content = (
        <div className={classes.reviewListView}>
          <DsLink
            asChild
            className={classes.userLink}
          >
            <Link to={`/${amUIPath.Users}/${request.partyUuid}?returnTo=/${amUIPath.Requests}`}>
              {t('request_page.review_user_link', {
                name: request.displayPartyName,
              })}
            </Link>
          </DsLink>
          {/* The snapshot stays stable while the modal is open, so only the initial load (empty
              snapshot) shows skeletons. Keeping rows mounted during background refetches lets a
              pending focus request from handleBack resolve to the row instead of being consumed
              by the fallback. */}
          {(isLoadingRequests || isFetchingRequests) &&
          snapshotPackages.length === 0 &&
          snapshotResources.length === 0 ? (
            <List>
              {Array.from({ length: request.numberOfRequests || 2 }).map((_, index) => (
                <ResourceListItem
                  key={index}
                  id={`placeholder-${index}`}
                  resourceName='xxxxxxxxxxxxxxxxxxxx'
                  ownerName='xxxxxxxxx xxxxxxxxxxx'
                  loading
                  as='div'
                  interactive={false}
                  shadow='none'
                />
              ))}
            </List>
          ) : (
            <>
              {snapshotPackages.length > 0 && (
                <>
                  <DsHeading
                    level={2}
                    data-size='2xs'
                    id='package-list-heading'
                  >
                    {t('request_page.package_list_title')}
                  </DsHeading>
                  <List aria-labelledby='package-list-heading'>
                    {snapshotPackages.map((p) => (
                      <PackageReviewRow
                        key={p.id}
                        pkg={p}
                        controls={itemControls({ packageId: p.id })}
                        onClick={() => handleSelection({ package: p })}
                      />
                    ))}
                  </List>
                </>
              )}
              {snapshotResources.length > 0 && (
                <>
                  <DsHeading
                    level={2}
                    data-size='2xs'
                    id='service-list-heading'
                  >
                    {t('request_page.resource_list_title')}
                  </DsHeading>
                  <ResourceList
                    aria-labelledby='service-list-heading'
                    size='xs'
                    border='dotted'
                    enableSearch={false}
                    showDetails={false}
                    resources={snapshotResources}
                    onSelect={(resource) => handleSelection({ resource })}
                    renderControls={(resource) => itemControls({ resourceId: resource.identifier })}
                  />
                </>
              )}
            </>
          )}
          <DsParagraph data-size='md'>{t('request_page.review_close_info')}</DsParagraph>
          <div className={classes.bulkActionButtons}>
            <DsButton
              aria-disabled={
                !hasApprovableRequests || !hasPendingRequests || !!bulkActionLoading || undefined
              }
              onClick={
                !hasApprovableRequests || !hasPendingRequests || !!bulkActionLoading
                  ? undefined
                  : handleApproveAll
              }
              loading={bulkActionLoading === 'approveAll'}
            >
              {t('request_page.approve_all')}
            </DsButton>
            <DsButton
              variant='secondary'
              data-color='danger'
              aria-disabled={!hasPendingRequests || !!bulkActionLoading || undefined}
              onClick={!hasPendingRequests || !!bulkActionLoading ? undefined : handleRejectAll}
              loading={bulkActionLoading === 'rejectAll'}
            >
              {t('request_page.reject_all')}
            </DsButton>
            <DsButton
              variant='secondary'
              aria-disabled={!!bulkActionLoading || !!actionLoading || undefined}
              onClick={!!bulkActionLoading || !!actionLoading ? undefined : handleClose}
            >
              {t('common.close')}
            </DsButton>
          </div>
        </div>
      );
    }
  }

  return (
    <TwoStepDialog
      ref={modalRef}
      className={classes.reviewModal}
      title={
        request === null
          ? ''
          : t('request_page.review_modal_title', { fromPartyName: request.displayPartyName })
      }
      isDetailView={isDetailView}
      onBack={handleBack}
      onClose={onClose}
      restoreFocus={restoreFocus}
    >
      {content}
    </TwoStepDialog>
  );
};

interface PackageReviewRowProps {
  pkg: AccessPackage;
  controls: ReactNode;
  onClick: () => void;
}

const PackageReviewRow = ({ pkg, controls, onClick }: PackageReviewRowProps) => {
  const { t } = useTranslation();
  useRestoreFocusTarget(pkg.id);
  return (
    <AccessPackageListItem
      id={pkg.id}
      name={pkg.name}
      description={t('access_packages.package_number_of_resources', {
        count: pkg.resources.length,
      })}
      interactive
      size='xs'
      border='dotted'
      controls={controls}
      onClick={onClick}
    />
  );
};
