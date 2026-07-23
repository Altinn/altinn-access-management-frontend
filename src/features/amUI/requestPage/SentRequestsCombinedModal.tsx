import React, { useState } from 'react';
import { DsHeading } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSentRequestsQuery, type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingRequestsList } from '../userRightsPage/SingleRightsSection/PendingRequests';
import { PendingPackageRequestsList } from '../userRightsPage/AccessPackageSection/PendingPackageRequests/RequestsList';
import { DelegationModalProvider } from '../common/DelegationModal/DelegationModalContext';
import { useRestoreFocus } from '../common/RestoreFocus';
import { TwoStepDialog } from '../common/TwoStepDialog';
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
  const restoreFocus = useRestoreFocus();

  const hasDetailView = !!selectedResource || !!selectedPackageRequest;

  const handleBack = () => {
    const focusTargetId = selectedResource?.identifier ?? selectedPackageRequest?.package?.id;
    if (focusTargetId) {
      restoreFocus.requestFocus(focusTargetId);
    }
    setSelectedResource(null);
    setSelectedPackageRequest(null);
  };

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
    <TwoStepDialog
      ref={modalRef}
      title={heading}
      isDetailView={hasDetailView}
      onBack={handleBack}
      onClose={() => {
        setSelectedResource(null);
        setSelectedPackageRequest(null);
        onClose();
      }}
      restoreFocus={restoreFocus}
    >
      {isModalOpen && (
        <div className={classes.container}>
          {(hasPendingSentPackageRequests || selectedPackageRequest) && !selectedResource && (
            <div className={classes.requestList}>
              {!hasDetailView && (
                <DsHeading
                  data-size='2xs'
                  level={2}
                >
                  {t('request_page.package_list_title')}
                </DsHeading>
              )}

              <DelegationModalProvider>
                <PendingPackageRequestsList
                  selectedRequest={selectedPackageRequest}
                  setSelectedRequest={setSelectedPackageRequest}
                />
              </DelegationModalProvider>
            </div>
          )}
          {(hasPendingSentResourceRequests || selectedResource) && !selectedPackageRequest && (
            <div className={classes.requestList}>
              {!hasDetailView && (
                <DsHeading
                  data-size='2xs'
                  level={2}
                >
                  {t('request_page.resource_list_title')}
                </DsHeading>
              )}
              <PendingRequestsList
                selectedResource={selectedResource}
                setSelectedResource={setSelectedResource}
              />
            </div>
          )}
        </div>
      )}
    </TwoStepDialog>
  );
};
