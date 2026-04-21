import React from 'react';
import { MinusCircleIcon } from '@navikt/aksel-icons';
import { DsButton, formatDisplayName } from '@altinn/altinn-components';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { useSingleRightRequests } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightRequests';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import classes from './PendingRequests.module.css';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useGetEnrichedSentResourceRequestsQuery } from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';
import { PendingRequestsDialog, PendingRequestsModal } from '../PendingRequestsDialog';

export const PendingRequests = () => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { singleRightRequests = [] } = useSingleRightRequests({
    canRequestRights: true,
    actingPartyUuid: actingParty?.partyUuid,
    fromPartyUuid: fromParty?.partyUuid,
  });

  return (
    <PendingRequestsDialog<ServiceResource>
      count={singleRightRequests.length}
      heading={t('delegation_modal.request.sent_requests_modal_header', {
        partyName: formatDisplayName({
          fullName: fromParty?.name || '',
          type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
        }),
      })}
      dialogClassName={classes.pendingRequestsModal}
      headingClassName={classes.pendingRequestsHeading}
      closeButtonClassName={classes.closeButton}
      backButtonClassName={classes.backButton}
      renderList={({ isSmallScreen, onSelect }) => (
        <PendingRequestsList
          onSelect={onSelect}
          isSmallScreen={isSmallScreen}
        />
      )}
      renderSelected={(selectedResource) => (
        <ResourceInfo
          resource={selectedResource}
          availableActions={[DelegationAction.REQUEST]}
        />
      )}
    />
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
  heading,
  onClose,
}: SentRequestsModalProps) => {
  return (
    <PendingRequestsModal<ServiceResource>
      modalRef={modalRef}
      isModalOpen={isModalOpen}
      heading={heading}
      onClose={onClose}
      dialogClassName={classes.pendingRequestsModal}
      headingClassName={classes.pendingRequestsHeading}
      closeButtonClassName={classes.closeButton}
      backButtonClassName={classes.backButton}
      renderList={({ isSmallScreen, onSelect }) => (
        <PendingRequestsList
          onSelect={onSelect}
          isSmallScreen={isSmallScreen}
        />
      )}
      renderSelected={(selectedResource) => (
        <ResourceInfo
          resource={selectedResource}
          availableActions={[DelegationAction.REQUEST]}
        />
      )}
    />
  );
};

interface PendingRequestsListProps {
  isSmallScreen: boolean;
  onSelect: (resource: ServiceResource) => void;
}

const PendingRequestsList = ({ isSmallScreen, onSelect }: PendingRequestsListProps) => {
  const { t } = useTranslation();
  const { actingParty, fromParty } = usePartyRepresentation();

  const { data: singleRightRequests = [], isLoading: isLoadingRequests } =
    useGetEnrichedSentResourceRequestsQuery(
      {
        ...getRequestPartyQueryParams(actingParty?.partyUuid, fromParty?.partyUuid),
        status: ['Pending'],
      },
      {
        skip: !actingParty?.partyUuid || !fromParty?.partyUuid,
      },
    );

  const { deleteRequest, isLoadingRequest } = useSingleRightRequests({
    canRequestRights: true,
    actingPartyUuid: actingParty?.partyUuid,
    fromPartyUuid: fromParty?.partyUuid,
  });

  return (
    <ResourceList
      isLoading={isLoadingRequests}
      size={isSmallScreen ? 'sm' : 'md'}
      enableSearch={false}
      resources={singleRightRequests
        .map((x) => x.resource)
        .filter((r): r is ServiceResource => !!r)}
      showDetails={false}
      onSelect={onSelect}
      renderControls={(resource) => {
        return (
          <DsButton
            variant='tertiary'
            aria-label={t('common.delete_request_for', { poa_object: resource.title })}
            onClick={() => deleteRequest(resource)}
            disabled={isLoadingRequest(resource.identifier)}
            loading={isLoadingRequest(resource.identifier)}
          >
            <MinusCircleIcon />
            {isSmallScreen ? '' : t('common.delete')}
          </DsButton>
        );
      }}
    />
  );
};
