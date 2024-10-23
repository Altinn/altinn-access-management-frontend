import * as React from 'react';
import { Button, Heading, Modal } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';

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
  const { setInfoView, setResourceToView, resourceToView, infoView, setSearchString, setFilters } =
    useDelegationModalContext();

  const onSelection = (resource: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  const modalRef = useRef<HTMLDialogElement>(null);

  const onClose = () => {
    setInfoView(false);
    setSearchString('');
    setFilters([]);
  };

  /* handle closing */
  useEffect(() => {
    const handleClose = () => onClose?.();
    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <Modal.Context>
      <Modal.Trigger
        size='md'
        variant='primary'
      >
        {t('common.add')} <PlusIcon />
      </Modal.Trigger>
      <Modal
        className={classes.modalDialog}
        backdropClose
        closeButton={t('common.close')}
        onClose={onClose}
        ref={modalRef}
      >
        {infoView ? (
          <Button
            variant='tertiary'
            color='accent'
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
        <div className={classes.content}>
          {infoView ? (
            <ResourceInfo
              resource={resourceToView}
              toParty={toParty}
              onDelegate={onClose}
            />
          ) : (
            <ResourceSearch onSelection={onSelection} />
          )}
        </div>
      </Modal>
    </Modal.Context>
  );
};
