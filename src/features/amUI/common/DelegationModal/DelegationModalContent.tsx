import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ArrowLeftIcon } from '@navikt/aksel-icons';
import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import { Button, DsDialog } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import { useAreaExpandedContextOrLocal } from '../AccessPackageList/AccessPackageExpandedContext';

import classes from './DelegationModal.module.css';
import { ResourceSearch } from './SingleRights/ResourceSearch';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { DelegationType } from './DelegationModal';
import { PackageSearch } from './AccessPackages/PackageSearch';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import type { DelegationAction } from './EditModal';
import { AccessPackageDelegationCheckProvider } from '../DelegationCheck/AccessPackageDelegationCheckContext';

export interface DelegationModalProps {
  delegationType: DelegationType;
  availableActions?: DelegationAction[];
}

export const DelegationModalContent = ({
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
  const { toParty } = usePartyRepresentation();
  const { closeAllAreas } = useAreaExpandedContextOrLocal();
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

  const onClosing = () => {
    reset();
    closeAllAreas();
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
        <AccessPackageDelegationCheckProvider packageIds={[packageToView.id]}>
          <AccessPackageInfo
            accessPackage={packageToView}
            availableActions={availableActions}
          />
        </AccessPackageDelegationCheckProvider>
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
      infoViewContent = resourceToView && <ResourceInfo resource={resourceToView} />;
      triggerButtonText = t('single_rights.give_new_single_right');
  }

  return (
    <DsDialog.TriggerContext>
      <DsDialog.Trigger
        data-size='sm'
        variant='secondary'
        className={classes.triggerButton}
      >
        {triggerButtonText}
        <PlusIcon />
      </DsDialog.Trigger>
      <DsDialog
        className={classes.modalDialog}
        closedby='any'
        closeButton={t('common.close')}
        onClose={reset}
        ref={modalRef}
      >
        <>
          {infoView && (
            <Button
              className={classes.backButton}
              variant='text'
              data-color='neutral'
              onClick={() => setInfoView(false)}
              icon={ArrowLeftIcon}
            >
              {t('common.back')}
            </Button>
          )}
          <div className={classes.content}>{infoView ? infoViewContent : searchViewContent}</div>
        </>
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
