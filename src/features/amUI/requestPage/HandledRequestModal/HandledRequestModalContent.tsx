import { type ReactNode, type RefObject } from 'react';
import { Link } from 'react-router';
import {
  AccessPackageListItem,
  DsHeading,
  DsLink,
  DsParagraph,
  List,
  ResourceListItem,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { CheckmarkCircleIcon, ChevronRightIcon, CircleSlashIcon } from '@navikt/aksel-icons';
import type { Request } from '../types';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { RequestResourceDetail } from '../RequestReviewModal/RequestResourceDetail';
import { RequestPackageDetail } from '../RequestReviewModal/RequestPackageDetail';
import { useRestoreFocus, useRestoreFocusTarget } from '../../common/RestoreFocus';
import { TwoStepDialog } from '../../common/TwoStepDialog';
import { amUIPath } from '@/routes/paths';
import classes from '../RequestReviewModal/RequestReviewModal.module.css';
import { useHandledRequests, type HandledDirection } from './useHandledRequests';

interface HandledRequestModalContentProps {
  modalRef: RefObject<HTMLDialogElement | null>;
  request: Request | null;
  direction: HandledDirection;
  onClose: () => void;
}

export const HandledRequestModalContent = ({
  modalRef,
  request,
  direction,
  onClose,
}: HandledRequestModalContentProps) => {
  const { t } = useTranslation();
  const restoreFocus = useRestoreFocus();

  const {
    isLoadingRequests,
    isFetchingRequests,
    snapshotResources,
    snapshotPackages,
    selectedResource,
    selectedPackage,
    outcomes,
    handleSelection,
    resetSelection,
  } = useHandledRequests(request, direction, () => modalRef.current?.close());

  const isReceived = direction === 'received';
  const isDetailView = !!selectedResource || !!selectedPackage;

  const handleBack = () => {
    const focusTargetId = selectedResource?.identifier ?? selectedPackage?.id;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    resetSelection();
  };

  const itemControls = (id: string) => {
    const status = outcomes[id]?.status;
    const chevron = (
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
          {chevron}
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
          {chevron}
        </span>
      );
    }
    return chevron;
  };

  let content: ReactNode = null;
  if (request !== null) {
    if (selectedResource) {
      const outcome = outcomes[selectedResource.identifier];
      content = (
        <RequestResourceDetail
          resource={selectedResource}
          toPartyName={request.displayPartyName || ''}
          processedStatus={outcome?.status}
          handledAt={outcome?.handledAt}
          handledByName={isReceived ? outcome?.handledByName : undefined}
        />
      );
    } else if (selectedPackage) {
      const outcome = outcomes[selectedPackage.id];
      content = (
        <RequestPackageDetail
          pkg={selectedPackage}
          toPartyName={request.displayPartyName || ''}
          processedStatus={outcome?.status}
          handledAt={outcome?.handledAt}
          handledByName={isReceived ? outcome?.handledByName : undefined}
        />
      );
    } else {
      content = (
        <div className={classes.reviewListView}>
          {isReceived && (
            <DsLink
              asChild
              className={classes.userLink}
            >
              <Link to={`/${amUIPath.Users}/${request.partyUuid}?returnTo=/${amUIPath.Requests}`}>
                {t('request_page.review_user_link', { name: request.displayPartyName })}
              </Link>
            </DsLink>
          )}
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
                    id='handled-package-list-heading'
                  >
                    {t('request_page.package_list_title')}
                  </DsHeading>
                  <List aria-labelledby='handled-package-list-heading'>
                    {snapshotPackages.map((p) => (
                      <PackageHandledRow
                        key={p.id}
                        pkg={p}
                        controls={itemControls(p.id)}
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
                    id='handled-service-list-heading'
                  >
                    {t('request_page.resource_list_title')}
                  </DsHeading>
                  <ResourceList
                    aria-labelledby='handled-service-list-heading'
                    size='xs'
                    border='dotted'
                    enableSearch={false}
                    showDetails={false}
                    resources={snapshotResources}
                    onSelect={(resource) => handleSelection({ resource })}
                    renderControls={(resource) => itemControls(resource.identifier)}
                  />
                </>
              )}
            </>
          )}
        </div>
      );
    }
  }

  return (
    <TwoStepDialog
      ref={modalRef}
      className={classes.reviewModal}
      title={
        direction === 'received'
          ? t('request_page.handled_received_modal_title', {
              fromPartyName: request?.displayPartyName,
            })
          : t('request_page.handled_sent_modal_title', { fromPartyName: request?.displayPartyName })
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

interface PackageHandledRowProps {
  pkg: AccessPackage;
  controls: ReactNode;
  onClick: () => void;
}

const PackageHandledRow = ({ pkg, controls, onClick }: PackageHandledRowProps) => {
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
