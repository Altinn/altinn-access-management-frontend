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
        <div className={classes.pendingRequestsModalContent}>
          <SnackbarProvider>
            <PendingRequestsList
              onClose={() => modalRef.current?.close()}
              selectedResource={selectedResource}
              setSelectedResource={setSelectedResource}
            />
            <Snackbar />
          </SnackbarProvider>
        </div>
      </DsDialog>
      {singleRightRequests?.length && (
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

  const { fromParty } = usePartyRepresentation();

  const { singleRightRequests, deleteRequest } = useSingleRightRequests({
    canRequestRights: true,
    includeResources: true,
  });

  return (
    <>
      {selectedResource ? (
        <>
          <div>
            <DsButton
              variant='tertiary'
              onClick={() => setSelectedResource(null)}
            >
              <ArrowLeftIcon />
              {t('common.back')}
            </DsButton>
          </div>
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
            size='md'
            enableSearch={false}
            resources={(singleRightRequests || []).map((x) => x.resource).filter((r) => !!r)}
            showDetails={false}
            onSelect={(resource) => setSelectedResource(resource)}
            renderControls={(resource) => {
              return (
                <DsButton
                  variant='tertiary'
                  onClick={() => deleteRequest(resource)}
                >
                  <MinusCircleIcon />
                  {t('common.delete')}
                </DsButton>
              );
            }}
          />
          <div>
            <DsButton
              variant='primary'
              onClick={onClose}
            >
              {t('common.close')}
            </DsButton>
          </div>
        </>
      )}
    </>
  );
};
