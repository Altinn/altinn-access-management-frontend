import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, HandshakeIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import {
  DsButton,
  DsDialog,
  DsHeading,
  formatDisplayName,
  ListItem,
  Snackbar,
  SnackbarProvider,
} from '@altinn/altinn-components';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { useSingleRightRequests } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightRequests';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import classes from './PendingRequests.module.css';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { useTranslation } from 'react-i18next';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { PartyType } from '@/rtk/features/userInfoApi';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { useGetEnrichedSentResourceRequestsQuery } from '@/rtk/features/requestApi';
import { getRequestPartyQueryParams } from '@/resources/utils/singleRightRequestUtils';

export const PendingRequests = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();

  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { singleRightRequests = [] } = useSingleRightRequests({
    canRequestRights: true,
  });

  return (
    <>
      <DsDialog
        ref={modalRef}
        closedby='any'
        onClose={() => {
          setSelectedResource(null);
          setIsModalOpen(false);
        }}
        className={classes.pendingRequestsModal}
      >
        <SnackbarProvider>
          {isModalOpen && (
            <PendingRequestsList
              onClose={() => modalRef.current?.close()}
              selectedResource={selectedResource}
              setSelectedResource={setSelectedResource}
            />
          )}
          <Snackbar />
        </SnackbarProvider>
      </DsDialog>
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

interface PendingRequestsListProps {
  selectedResource: ServiceResource | null;
  setSelectedResource: (resource: ServiceResource | null) => void;
  onClose: () => void;
}
const PendingRequestsList = ({
  onClose,
  selectedResource,
  setSelectedResource,
}: PendingRequestsListProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
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
  });

  return (
    <>
      {selectedResource ? (
        <>
          <DsButton
            variant='tertiary'
            className={classes.backButton}
            onClick={() => setSelectedResource(null)}
          >
            <ArrowLeftIcon />
            {t('common.back')}
          </DsButton>
          <ResourceInfo
            resource={selectedResource}
            availableActions={[DelegationAction.REQUEST]}
          />
        </>
      ) : (
        <>
          <DsHeading
            data-size='xs'
            level={1}
          >
            {t('delegation_modal.request.sent_requests_modal_header', {
              partyName: formatDisplayName({
                fullName: fromParty?.name || '',
                type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
              }),
            })}
          </DsHeading>
          <ResourceList
            isLoading={isLoadingRequests}
            size={isSmallScreen ? 'sm' : 'md'}
            enableSearch={false}
            resources={singleRightRequests
              .map((x) => x.resource)
              .filter((r): r is ServiceResource => !!r)}
            showDetails={false}
            onSelect={(resource) => setSelectedResource(resource)}
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
          <DsButton
            variant='primary'
            className={classes.closeButton}
            onClick={onClose}
          >
            {t('common.close')}
          </DsButton>
        </>
      )}
    </>
  );
};
