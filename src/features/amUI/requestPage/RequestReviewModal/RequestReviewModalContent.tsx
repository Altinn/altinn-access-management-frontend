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
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { RequestResourceDetail } from './RequestResourceDetail';
import { useRequestReview } from './useRequestReview';
import classes from './RequestReviewModal.module.css';
import { amUIPath } from '@/routes/paths';
import { RequestPackageDetail } from './RequestPackageDetail';

interface RequestReviewModalContentProps {
  request: Request | null;
  onClose: () => void;
}

export const RequestReviewModalContent = ({ request, onClose }: RequestReviewModalContentProps) => {
  const { t } = useTranslation();

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
  } = useRequestReview(request, onClose);

  if (request === null) {
    return null;
  }

  if (selectedResource) {
    return (
      <RequestResourceDetail
        resource={selectedResource}
        toPartyName={request?.displayPartyName || ''}
        processedStatus={processedRequests[selectedResource.identifier]}
        actionLoading={actionLoading}
        onBack={resetSelection}
        onApprove={() => handleApprove({ resourceId: selectedResource.identifier })}
        onReject={() => handleReject({ resourceId: selectedResource.identifier })}
        cannotApprove={cannotApprove(selectedResource.identifier)}
      />
    );
  }

  if (selectedPackage) {
    return (
      <RequestPackageDetail
        pkg={selectedPackage}
        toPartyName={request?.displayPartyName || ''}
        processedStatus={processedRequests[selectedPackage.id]}
        actionLoading={actionLoading}
        onBack={resetSelection}
        onApprove={() => handleApprove({ packageId: selectedPackage.id })}
        onReject={() => handleReject({ packageId: selectedPackage.id })}
        cannotApprove={cannotApprove(selectedPackage.id)}
      />
    );
  }

  const itemControls = (id: string) => {
    const status = processedRequests[id];
    if (status === 'approved') {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_approved')}</DsParagraph>
          <CheckmarkCircleIcon className={classes.approvedIcon} />
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_rejected')}</DsParagraph>
          <CircleSlashIcon className={classes.rejectedIcon} />
        </span>
      );
    }
    if (cannotApprove(id)) {
      return (
        <span className={classes.processedStatus}>
          <DsParagraph data-size='md'>{t('request_page.review_warning')}</DsParagraph>
          <ExclamationmarkTriangleFillIcon className={classes.warningIcon} />
        </span>
      );
    }
    return <ChevronRightIcon className={classes.chevronIcon} />;
  };

  return (
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
          <DsHeading
            level={4}
            data-size='2xs'
          >
            Tilgangspakker:{' '}
          </DsHeading>
          <List>
            {snapshotPackages.map((p) => (
              <AccessPackageListItem
                key={p.id}
                id={p.id}
                name={p.name}
                description={t('access_packages.package_number_of_resources', {
                  count: p.resources.length,
                })}
                interactive={true}
                size='xs'
                border='solid'
                variant='default'
                controls={itemControls(p.id)}
                onClick={() => handleSelection({ package: p })}
              />
            ))}
          </List>
          <DsHeading
            level={4}
            data-size='2xs'
          >
            Tjenester:{' '}
          </DsHeading>
          <List>
            <ResourceList
              size='xs'
              border='solid'
              enableSearch={false}
              showDetails={false}
              interactive={(resource) => processedRequests[resource.identifier] === undefined}
              resources={snapshotResources}
              onSelect={(resource) => handleSelection({ resource })}
              renderControls={(resource) => itemControls(resource.identifier)}
            />
          </List>
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
  );
};
