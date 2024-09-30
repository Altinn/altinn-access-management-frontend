import * as React from 'react';
import { Button, Heading, Modal } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import { useRef } from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './ResourceSearch';
import { ResourceInfo } from './ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';

export interface DelegationModalProps {
  toParty: Party;
}

export const DelegationModalContent = ({ toParty }: DelegationModalProps) => {
  const { t } = useTranslation();
  const { setInfoView, setResourceToView, resourceToView, infoView } = useDelegationModalContext();
  const modalRef = useRef<HTMLDialogElement>(null);

  const onSelection = (resource: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  const closeModal = () => modalRef.current?.close();

  const onClose = () => {
    setInfoView(false);
  };

  return (
    <Modal.Root>
      <Modal.Trigger
        size='md'
        variant='primary'
      >
        {t('common.add')} <PlusIcon />
      </Modal.Trigger>
      <Modal.Dialog
        ref={modalRef}
        className={classes.modalDialog}
        onInteractOutside={closeModal}
        onClose={onClose}
      >
        <Modal.Header>
          {infoView ? (
            <Button
              variant='tertiary'
              color='second'
              onClick={() => setInfoView(false)}
              icon
            >
              <ArrowLeftIcon fontSize='1.5em' />
              {t('common.back')}
            </Button>
          ) : (
            <Heading
              level={2}
              size='sm'
            >
              <Trans
                i18nKey='delegation_modal.give_to_name'
                values={{ name: toParty.name }}
                components={{ strong: <strong /> }}
              />
            </Heading>
          )}
        </Modal.Header>
        <Modal.Content className={classes.content}>
          {infoView ? (
            <ResourceInfo
              resource={resourceToView}
              toParty={toParty}
              onDelegate={closeModal}
            />
          ) : (
            <ResourceSearch onSelection={onSelection} />
          )}
        </Modal.Content>
      </Modal.Dialog>
    </Modal.Root>
  );
};
