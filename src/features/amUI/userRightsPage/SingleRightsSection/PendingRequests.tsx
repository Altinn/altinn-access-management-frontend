import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import {
  DsButton,
  DsDialog,
  DsHeading,
  formatDisplayName,
  ListItem,
} from '@altinn/altinn-components';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { useSingleRightRequests } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightRequests';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import classes from './PendingRequests.module.css';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { useGetEnrichedSentResourceRequestsQuery } from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { useAutoFocusRef } from '@/resources/hooks/useAutoFocusRef';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusAfterSettled,
} from '../../common/RestoreFocus';

export const PendingRequests = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { singleRightRequests = [] } = useSingleRightRequests({
    canRequestRights: true,
    actingPartyUuid: actingParty?.partyUuid,
    fromPartyUuid: fromParty?.partyUuid,
  });

  return (
    <>
      <SentRequestsModal
        isModalOpen={isModalOpen}
        modalRef={modalRef}
        heading={t('delegation_modal.request.sent_requests_modal_header', {
          partyName: formatDisplayName({
            fullName: fromParty?.name || '',
            type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
          }),
        })}
        onClose={() => setIsModalOpen(false)}
      />
      {singleRightRequests.length > 0 && (
        <ListItem
          title={t('delegation_modal.request.sent_requests_item')}
          description={t('delegation_modal.request.active_access_request', {
            count: singleRightRequests.length,
          })}
          icon={HandshakeIcon}
          linkIcon
          color='neutral'
          variant='tinted'
          border='solid'
          interactive
          as='button'
          containerAs='div'
          badge={
            isSmallScreen ? undefined : <div>{t('delegation_modal.request.view_requests')}</div>
          }
          onClick={() => {
            setIsModalOpen(true);
            modalRef.current?.showModal();
          }}
        />
      )}
    </>
  );
};

interface SentRequestsModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}
export const SentRequestsModal = ({
  modalRef,
  isModalOpen,
  onClose,
  heading,
}: SentRequestsModalProps) => {
  const { t } = useTranslation();
  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedResource(null);
        onClose();
      }}
      className={classes.pendingRequestsModal}
    >
      {isModalOpen && (
        <PendingRequestsList
          heading={heading}
          selectedResource={selectedResource}
          setSelectedResource={setSelectedResource}
        />
      )}

      {!selectedResource && (
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

interface PendingRequestsListProps {
  selectedResource: ServiceResource | null;
  heading?: string;
  headingSize?: '2xs' | 'xs';
  setSelectedResource: (resource: ServiceResource | null) => void;
}

export const PendingRequestsList = ({
  selectedResource,
  heading,
  headingSize = 'xs',
  setSelectedResource,
}: PendingRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { actingParty, fromParty } = usePartyRepresentation();
  const backButtonRef = useAutoFocusRef<HTMLButtonElement>();

  const {
    data: singleRightRequests = [],
    isLoading: isLoadingRequests,
    isFetching: isRefetchingRequests,
  } = useGetEnrichedSentResourceRequestsQuery(
    {
      ...getRequestPartyQueryParams(actingParty?.partyUuid, fromParty?.partyUuid),
      status: ['Pending'],
    },
    {
      skip: !actingParty?.partyUuid || !fromParty?.partyUuid,
    },
  );

  const restoreFocus = useRestoreFocus();

  const resources = singleRightRequests
    .map((x) => x.resource)
    .filter((r): r is ServiceResource => !!r);
  const restoreFocusAfterDelete = useRestoreFocusAfterSettled<string>({
    isSettling: isRefetchingRequests,
    onRestore: restoreFocus.requestFocus,
  });

  const { deleteRequest, isLoadingRequest } = useSingleRightRequests({
    canRequestRights: true,
    actingPartyUuid: actingParty?.partyUuid,
    fromPartyUuid: fromParty?.partyUuid,
    onDeleteRequestSuccess: (resource) => restoreFocusAfterDelete(resource.identifier),
  });

  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <div>
        {selectedResource ? (
          <>
            <DsButton
              ref={backButtonRef}
              variant='tertiary'
              className={classes.backButton}
              onClick={() => {
                restoreFocus.requestFocus(selectedResource.identifier);
                setSelectedResource(null);
              }}
            >
              <ArrowLeftIcon aria-hidden='true' />
              {t('common.back')}
            </DsButton>
            <ResourceInfo
              resource={selectedResource}
              availableActions={[DelegationAction.REQUEST]}
            />
          </>
        ) : (
          <>
            {heading && (
              <RestoreFocusFallback>
                <DsHeading
                  data-size={headingSize}
                  level={2}
                  className={classes.pendingRequestsHeading}
                >
                  {heading}
                </DsHeading>
              </RestoreFocusFallback>
            )}
            <ResourceList
              isLoading={isLoadingRequests}
              size={isSmallScreen ? 'sm' : 'md'}
              enableSearch={false}
              resources={resources}
              showDetails={false}
              onSelect={(resource) => setSelectedResource(resource)}
              renderControls={(resource) => {
                if (isSmallScreen) return undefined;
                return (
                  <DsButton
                    variant='tertiary'
                    aria-label={t('common.delete_request_for', { poa_object: resource.title })}
                    onClick={() => deleteRequest(resource)}
                    disabled={isLoadingRequest(resource.identifier)}
                    loading={isLoadingRequest(resource.identifier)}
                  >
                    <MinusCircleIcon aria-hidden='true' />
                    {t('common.delete')}
                  </DsButton>
                );
              }}
            />
          </>
        )}
      </div>
    </RestoreFocusProvider>
  );
};
