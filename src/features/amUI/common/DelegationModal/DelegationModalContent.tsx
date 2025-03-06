import * as React from 'react';
import { Button, Dialog } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import { useEffect, useRef } from 'react';

import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { SnackbarProvider } from '../Snackbar';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './SingleRights/ResourceSearch';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { DelegationType } from './DelegationModal';
import { PackageSearch } from './AccessPackages/PackageSearch';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import type { DelegationAction } from './EditModal';

export interface DelegationModalProps {
  toPartyUuid: string;
  fromPartyUuid: string;
  delegationType: DelegationType;
  availableActions?: DelegationAction[];
}

export const DelegationModalContent = ({
  toPartyUuid,
  fromPartyUuid,
  delegationType,
  availableActions,
}: DelegationModalProps) => {
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

  const onPackageSelection = (accessPackage?: AccessPackage, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setInfoView(true);
    setPackageToView(accessPackage);
  };

  const modalRef = useRef<HTMLDialogElement>(null);

  const { data: toParty } = useGetPartyByUUIDQuery(toPartyUuid);

  const onClosing = () => {
    reset();
  };

  useEffect(() => {
    const handleClose = () => onClosing();

    if (modalRef?.current) {
      modalRef.current.addEventListener('close', handleClose);
    }
    return () => {
      if (modalRef?.current) {
        modalRef.current.removeEventListener('close', handleClose);
      }
    };
  }, [onClosing, modalRef]);

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
          availableActions={availableActions}
        />
      );
      infoViewContent = packageToView && (
        <AccessPackageInfo
          accessPackage={packageToView}
          toPartyUuid={toPartyUuid}
          fromPartyUuid={fromPartyUuid}
          availableActions={availableActions}
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
          toPartyUuid={toPartyUuid}
          fromPartyUuid={fromPartyUuid}
        />
      );
      triggerButtonText = t('single_rights.give_new_single_right');
  }

  return (
    <Dialog.TriggerContext>
      <Dialog.Trigger
        data-size='sm'
        variant='primary'
        className={classes.triggerButton}
      >
        {triggerButtonText} <PlusIcon />
      </Dialog.Trigger>
      <Dialog
        className={classes.modalDialog}
        closedby='any'
        closeButton={t('common.close')}
        onClose={reset}
        ref={modalRef}
      >
        <SnackbarProvider>
          <>
            {infoView && (
              <Button
                className={classes.backButton}
                variant='tertiary'
                data-color='neutral'
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
      </Dialog>
    </Dialog.TriggerContext>
  );
};
