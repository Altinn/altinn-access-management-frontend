import { type ReactNode } from 'react';
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
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusTarget,
} from '../../common/RestoreFocus';

interface RequestReviewModalContentProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModalContent = ({ request, onClose }: RequestReviewModalContentProps) => {
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
    cannotApprove,
    handleClose,
    handleApprove,
    handleReject,
    handleSelection,
  } = useRequestReview(request, onClose, restoreFocus.requestFocus);

  if (request === null) {
    return null;
  }

  // Return focus to the originating list row when leaving a detail view
  const handleBack = () => {
    const focusTargetId = selectedResource?.identifier ?? selectedPackage?.id;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    resetSelection();
  };

  if (selectedResource) {
    const processed = processedRequests[selectedResource.identifier];
    return (
      <RequestResourceDetail
        resource={selectedResource}
        toPartyName={request?.displayPartyName || ''}
        processedStatus={processed?.status}
        handledAt={processed?.handledAt}
        actionLoading={actionLoading}
        onBack={handleBack}
        onApprove={() => handleApprove({ resourceId: selectedResource.identifier })}
        onReject={() => handleReject({ resourceId: selectedResource.identifier })}
        cannotApprove={cannotApprove({ resourceId: selectedResource.identifier })}
      />
    );
  }

  if (selectedPackage) {
    const processed = processedRequests[selectedPackage.id];
    return (
      <RequestPackageDetail
        pkg={selectedPackage}
        toPartyName={request?.displayPartyName || ''}
        processedStatus={processed?.status}
        handledAt={processed?.handledAt}
        actionLoading={actionLoading}
        onBack={handleBack}
        onApprove={() => handleApprove({ packageId: selectedPackage.id })}
        onReject={() => handleReject({ packageId: selectedPackage.id })}
        cannotApprove={cannotApprove({ packageId: selectedPackage.id })}
      />
    );
  }

  const itemControls = ({ resourceId, packageId }: { resourceId?: string; packageId?: string }) => {
    const id = resourceId ?? packageId ?? '';
    const status = processedRequests[id]?.status;
    if (status === 'approved') {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_approved')}</DsParagraph>
          <CheckmarkCircleIcon
            className={classes.approvedIcon}
            aria-hidden='true'
          />
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
        </span>
      );
    }
    return (
      <ChevronRightIcon
        className={classes.chevronIcon}
        aria-hidden='true'
      />
    );
  };

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <RestoreFocusFallback>
        <div className={classes.reviewListView}>
          <DsHeading
            level={1}
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
            <Link to={`/${amUIPath.Users}/${request?.partyUuid}?returnTo=/${amUIPath.Requests}`}>
              {t('request_page.review_user_link', {
                name: request?.displayPartyName,
              })}
            </Link>
          </DsLink>
          {isLoadingRequests || isFetchingRequests ? (
            <List>
              {Array.from({ length: request?.numberOfRequests || 2 }).map((_, index) => (
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
                    interactive={() => true}
                    resources={snapshotResources}
                    onSelect={(resource) => handleSelection({ resource })}
                    renderControls={(resource) => itemControls({ resourceId: resource.identifier })}
                  />
                </>
              )}
            </>
          )}
          <DsParagraph data-size='md'>{t('request_page.review_close_info')}</DsParagraph>
          <DsButton
            variant='secondary'
            onClick={handleClose}
            className={classes.closeButton}
          >
            {t('common.close')}
          </DsButton>
        </div>
      </RestoreFocusFallback>
    </RestoreFocusProvider>
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
