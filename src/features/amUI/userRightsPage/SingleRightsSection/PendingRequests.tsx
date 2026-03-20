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

export const PendingRequests = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const { t } = useTranslation();

  const [selectedResource, setSelectedResource] = useState<ServiceResource | null>(null);

  const { singleRightRequests } = useSingleRightRequests({
    canRequestRights: true,
    includeResources: true,
  });

  return (
    <>
      <DsDialog
        ref={modalRef}
        closedby='any'
        onClose={() => setSelectedResource(null)}
        className={classes.pendingRequestsModal}
      >
        <SnackbarProvider>
          <PendingRequestsList
            onClose={() => modalRef.current?.close()}
            selectedResource={selectedResource}
            setSelectedResource={setSelectedResource}
          />
          <Snackbar />
        </SnackbarProvider>
      </DsDialog>
      {singleRightRequests?.length > 0 && (
        <ListItem
          title={t('delegation_modal.request.sent_requests_item')}
          description={`${singleRightRequests.length} ${
            singleRightRequests.length === 1
              ? t('delegation_modal.request.active_access_request_single')
              : t('delegation_modal.request.active_access_request_plural')
          }`}
          icon={HandshakeIcon}
          linkIcon
          color='neutral'
          variant='tinted'
          border='solid'
          interactive
          as='button'
          badge={<div>{t('delegation_modal.request.view_requests')}</div>}
          onClick={() => modalRef.current?.showModal()}
        />
      )}
    </>
  );
};

interface ResourceAlertProps {
  selectedResource: ServiceResource | null;
  setSelectedResource: (resource: ServiceResource | null) => void;
  onClose: () => void;
}
const PendingRequestsList = ({
  onClose,
  selectedResource,
  setSelectedResource,
}: ResourceAlertProps) => {
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { fromParty } = usePartyRepresentation();

  const { singleRightRequests, deleteRequest, isLoadingRequest } = useSingleRightRequests({
    canRequestRights: true,
    includeResources: true,
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
            size={isSmallScreen ? 'sm' : 'md'}
            enableSearch={false}
            resources={(singleRightRequests || [])
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
