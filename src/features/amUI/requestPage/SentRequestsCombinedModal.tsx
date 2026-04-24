import React, { useState } from 'react';
import {
  DsButton,
  DsDialog,
  DsHeading,
  Snackbar,
  SnackbarProvider,
} from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSentRequestsQuery, type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingRequestsList } from '../userRightsPage/SingleRightsSection/PendingRequests';
import { PendingPackageRequestsList } from '../userRightsPage/AccessPackageSection/PendingPackageRequests/RequestsList';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import classes from './SentRequestsCombinedModal.module.css';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

interface SentRequestsCombinedModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}

export const SentRequestsCombinedModal = ({
  modalRef,
  isModalOpen,
  heading,
  onClose,
}: SentRequestsCombinedModalProps) => {
  const { t } = useTranslation();
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [selectedPackageRequest, setSelectedPackageRequest] =
    useState<EnrichedPackageRequest | null>(null);

  const hasDetailView = !!selectedResource || !!selectedPackageRequest;

  const { actingParty, fromParty } = usePartyRepresentation();
  const { data: pendingSentAccessRequests } = useGetSentRequestsQuery(
    { party: actingParty?.partyUuid || '', status: ['Pending'], to: fromParty?.partyUuid },
    { skip: !isModalOpen || !actingParty?.partyUuid || !fromParty?.partyUuid },
  );

  const hasPendingSentResourceRequests = pendingSentAccessRequests
    ? pendingSentAccessRequests.some((request) => request.resourceId)
    : false;
  const hasPendingSentPackageRequests = pendingSentAccessRequests
    ? pendingSentAccessRequests.some((request) => request.packageId)
    : false;

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedResource(null);
        setSelectedPackageRequest(null);
        onClose();
      }}
      className={classes.dialog}
    >
      <SnackbarProvider>
        {isModalOpen && (
          <div className={classes.container}>
            {!hasDetailView && (
              <DsHeading
                data-size='xs'
                level={1}
                className={classes.heading}
              >
                {heading}
              </DsHeading>
            )}
            {hasPendingSentPackageRequests && (
              <div className={classes.requestList}>
                {!hasDetailView && (
                  <DsHeading
                    data-size='2xs'
                    level={2}
                  >
                    {t('request_page.package_list_title')}
                  </DsHeading>
                )}
                {!selectedResource && hasPendingSentPackageRequests && (
                  <DelegationModalProvider>
                    <PendingPackageRequestsList
                      selectedRequest={selectedPackageRequest}
                      setSelectedRequest={setSelectedPackageRequest}
                    />
                  </DelegationModalProvider>
                )}
              </div>
            )}
            {hasPendingSentResourceRequests && (
              <div className={classes.requestList}>
                {!hasDetailView && (
                  <DsHeading
                    data-size='2xs'
                    level={2}
                  >
                    {t('request_page.resource_list_title')}
                  </DsHeading>
                )}
                {!selectedPackageRequest && hasPendingSentResourceRequests && (
                  <PendingRequestsList
                    selectedResource={selectedResource}
                    setSelectedResource={setSelectedResource}
                  />
                )}
              </div>
            )}
          </div>
        )}
        <Snackbar />
      </SnackbarProvider>
      {!hasDetailView && (
        <DsButton
          variant='primary'
          className={classes.closeButton}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </DsButton>
      )}
    </DsDialog>
  );
};
