import { Link } from 'react-router';
import {
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
    selectedResource,
    setSelectedResource,
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
        onBack={() => setSelectedResource(null)}
        onApprove={() => handleApprove(selectedResource)}
        onReject={() => handleReject(selectedResource)}
        cannotApprove={cannotApprove(selectedResource.identifier)}
      />
    );
  }

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
                id={`placeholder-${index}`}
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
            interactive={(resource) => processedRequests[resource.identifier] === undefined}
            resources={snapshotResources}
            onSelect={(resource) => handleSelection(resource)}
            renderControls={(resource) => {
              const status = processedRequests[resource.identifier];
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
  );
};
