import * as React from 'react';
import { Button, Heading, Modal } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';

import type { Party } from '@/rtk/features/lookup/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { SnackbarProvider } from '../../common/Snackbar';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './SingleRights/ResourceSearch';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { DelegationType } from './DelegationModal';
import { PackageSearch } from './AccessPackages/PackageSearch';

export interface DelegationModalProps {
  toParty: Party;
  delegationType: DelegationType;
}

export const DelegationModalContent = ({ toParty, delegationType }: DelegationModalProps) => {
  const { t } = useTranslation();
  const {
    setInfoView,
    setResourceToView,
    resourceToView,
    setPackageToView,
    packageToView,
    infoView,
    setSearchString,
    setFilters,
  } = useDelegationModalContext();

  const onResourceSelection = (resource?: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  const onPackageSelection = (accessPackage?: AccessPackage) => {
    setInfoView(true);
    setPackageToView(accessPackage);
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

  let searchViewContent;
  let infoViewContent;

  switch (delegationType) {
    case DelegationType.AccessPackage:
      searchViewContent = (
        <PackageSearch
          onSelection={onPackageSelection}
          toParty={toParty}
        />
      );
      infoViewContent = <></>; // TODO: Add info view for chosen access package
      break;
    default:
      searchViewContent = (
        <ResourceSearch
          onSelection={onResourceSelection}
          toParty={toParty}
        />
      );
      infoViewContent = resourceToView && (
        <ResourceInfo
          resource={resourceToView}
          toParty={toParty}
          onDelegate={onClose}
        />
      );
  }

  return (
    <Modal.Context>
      <Modal.Trigger
        size='sm'
        variant='secondary'
        className={classes.triggerButton}
      >
        {t('single_rights.give_new_single_right')} <PlusIcon />
      </Modal.Trigger>
      <Modal
        className={classes.modalDialog}
        backdropClose
        closeButton={t('common.close')}
        onClose={onClose}
        ref={modalRef}
      >
        <SnackbarProvider>
          <>
            {infoView && (
              <Button
                className={classes.backButton}
                variant='tertiary'
                color='neutral'
                onClick={() => setInfoView(false)}
                icon
              >
                <ArrowLeftIcon fontSize='1.5em' />
                {t('common.back')}
              </Button>
            )}
            <div className={classes.content}>{infoView ? infoViewContent : searchViewContent}</div>
          </>
        </SnackbarProvider>
      </Modal>
    </Modal.Context>
  );
};
