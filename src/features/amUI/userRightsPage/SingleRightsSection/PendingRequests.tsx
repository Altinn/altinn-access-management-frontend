import React, { useRef } from 'react';
import { HandshakeIcon, MinusCircleIcon } from '@navikt/aksel-icons';
import {
  DsButton,
  DsDialog,
  DsHeading,
  ListItem,
  Snackbar,
  SnackbarProvider,
} from '@altinn/altinn-components';
import { ResourceList } from '../../common/ResourceList/ResourceList';
import { useSingleRightRequests } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightRequests';
import { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import classes from './PendingRequests.module.css';

export const PendingRequests = () => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const { singleRightRequests } = useSingleRightRequests({
    canRequestRights: true,
    includeResources: true,
  });

  return (
    <>
      <DsDialog
        ref={modalRef}
        closedby='any'
        className={classes.pendingRequestsModal}
      >
        <div className={classes.pendingRequestsModalContent}>
          <DsHeading
            data-size='xs'
            level={1}
          >
            Din forespørsel om tilganger til Fysioterapeutene AS er sendt. Du vil få beskjed når de
            er godkjent.
          </DsHeading>
          <SnackbarProvider>
            <PendingRequestsList />
            <Snackbar />
          </SnackbarProvider>
        </div>
        <DsButton
          variant='primary'
          onClick={() => modalRef.current?.close()}
        >
          Lukk
        </DsButton>
      </DsDialog>
      {singleRightRequests?.length && (
        <ListItem
          title='Forespørsel om tilgang'
          description={`${singleRightRequests.length} ${singleRightRequests.length === 1 ? 'aktiv' : 'aktive'}`}
          icon={HandshakeIcon}
          linkIcon
          color='neutral'
          variant='tinted'
          border='solid'
          interactive
          as='button'
          badge={<div>Se forespørsler</div>}
          onClick={() => {
            modalRef.current?.showModal();
          }}
        />
      )}
    </>
  );
};

const PendingRequestsList = () => {
  const { singleRightRequests, deleteRequest } = useSingleRightRequests({
    canRequestRights: true,
    includeResources: true,
  });

  return (
    <ResourceList
      resources={
        (singleRightRequests || []).map((x) => x.resource).filter((r) => !!r) as ServiceResource[]
      }
      renderControls={(resource) => {
        return (
          <DsButton
            variant='tertiary'
            onClick={() => deleteRequest(resource)}
          >
            <MinusCircleIcon />
            Slett
          </DsButton>
        );
      }}
    />
  );
};
