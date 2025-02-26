import * as React from 'react';
import { Button, Modal } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';

import { SnackbarProvider } from '../Snackbar';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './SingleRights/ResourceSearch';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { DelegationType } from './DelegationModal';
import { PackageSearch } from './AccessPackages/PackageSearch';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';

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
    reset,
    setActionError,
  } = useDelegationModalContext();

  const onResourceSelection = (resource?: ServiceResource) => {
    setInfoView(true);
    setResourceToView(resource);
  };

  const onPackageSelection = (accessPackage?: AccessPackage, error: boolean = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setPackageToView(accessPackage);
  };

  const modalRef = useRef<HTMLDialogElement>(null);

  const onClose = () => {
    reset();
  };

  /* handle closing */
  useEffect(() => {
    const handleClose = () => onClose();
    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose]);

  let searchViewContent: JSX.Element | undefined;
  let infoViewContent: JSX.Element | undefined;
  let triggerButtonText: string | undefined;

  switch (delegationType) {
    case DelegationType.AccessPackage:
      searchViewContent = (
        <PackageSearch
          onSelection={onPackageSelection}
          toParty={toParty}
          onActionError={(accessPackage: AccessPackage) => {
            onPackageSelection(accessPackage, true);
          }}
        />
      );
      infoViewContent = packageToView && (
        <AccessPackageInfo
          accessPackage={packageToView}
          toParty={toParty}
        />
      );
      triggerButtonText = t('access_packages.give_new_button');
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
        />
      );
      triggerButtonText = t('single_rights.give_new_single_right');
  }

  return (
    <Modal.Context>
      <Modal.Trigger
        size='sm'
        variant='primary'
        className={classes.triggerButton}
      >
        {triggerButtonText} <PlusIcon />
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
