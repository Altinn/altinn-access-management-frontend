import { type ReactNode, type RefObject, useMemo } from 'react';
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
import type { Request, ProcessedStatus } from '../types';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { RequestResourceDetail } from '../RequestReviewModal/RequestResourceDetail';
import { RequestPackageDetail } from '../RequestReviewModal/RequestPackageDetail';
import { useRestoreFocus, useRestoreFocusTarget } from '../../common/RestoreFocus';
import { TwoStepDialog } from '../../common/TwoStepDialog';
import { amUIPath } from '@/routes/paths';
import classes from '../RequestReviewModal/RequestReviewModal.module.css';
import {
  useHandledRequests,
  type HandledDirection,
  type HandledResourceItem,
} from './useHandledRequests';

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
    handledResources,
    handledPackages,
    selectedResourceItem,
    selectedPackageItem,
    handleSelection,
    resetSelection,
  } = useHandledRequests(request, direction, () => modalRef.current?.close());

  const isReceived = direction === 'received';
  const isDetailView = !!selectedResourceItem || !!selectedPackageItem;

  const handleBack = () => {
    const focusTargetId = selectedResourceItem?.requestId ?? selectedPackageItem?.requestId;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    resetSelection();
  };

  const itemControls = (status?: ProcessedStatus) => {
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

  // `ResourceList` keys and identifies rows by the resource's `id`. The same resource can appear in
  // several handled requests, so we key each row by its request id (making duplicates distinct rows)
  // and map back to the originating item on select / when rendering controls.
  const resourceRows = useMemo<(ServiceResource & { id: string })[]>(
    () => handledResources.map((item) => ({ ...item.resource, id: item.requestId })),
    [handledResources],
  );
  const resourceItemById = useMemo(
    () =>
      new Map<string, HandledResourceItem>(handledResources.map((item) => [item.requestId, item])),
    [handledResources],
  );

  let content: ReactNode = null;
  if (request !== null) {
    if (selectedResourceItem) {
      const { resource, outcome } = selectedResourceItem;
      content = (
        <RequestResourceDetail
          resource={resource}
          toPartyName={request.displayPartyName || ''}
          processedStatus={outcome.status}
          handledAt={outcome.handledAt}
          handledByName={isReceived ? outcome.handledByName : undefined}
        />
      );
    } else if (selectedPackageItem) {
      const { package: pkg, outcome } = selectedPackageItem;
      content = (
        <RequestPackageDetail
          pkg={pkg}
          toPartyName={request.displayPartyName || ''}
          processedStatus={outcome.status}
          handledAt={outcome.handledAt}
          handledByName={isReceived ? outcome.handledByName : undefined}
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
          handledPackages.length === 0 &&
          handledResources.length === 0 ? (
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
              {handledPackages.length > 0 && (
                <>
                  <DsHeading
                    level={2}
                    data-size='2xs'
                    id='handled-package-list-heading'
                  >
                    {t('request_page.package_list_title')}
                  </DsHeading>
                  <List aria-labelledby='handled-package-list-heading'>
                    {handledPackages.map((item) => (
                      <PackageHandledRow
                        key={item.requestId}
                        requestId={item.requestId}
                        pkg={item.package}
                        controls={itemControls(item.outcome.status)}
                        onClick={() => handleSelection({ packageItem: item })}
                      />
                    ))}
                  </List>
                </>
              )}
              {handledResources.length > 0 && (
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
                    resources={resourceRows}
                    onSelect={(resource) =>
                      handleSelection({ resourceItem: resourceItemById.get(resource.id) })
                    }
                    renderControls={(resource) =>
                      itemControls(resourceItemById.get(resource.id)?.outcome.status)
                    }
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
  requestId: string;
  pkg: AccessPackage;
  controls: ReactNode;
  onClick: () => void;
}

const PackageHandledRow = ({ requestId, pkg, controls, onClick }: PackageHandledRowProps) => {
  const { t } = useTranslation();
  useRestoreFocusTarget(requestId);
  return (
    <AccessPackageListItem
      id={requestId}
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
