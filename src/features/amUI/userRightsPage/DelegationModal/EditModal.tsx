import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { forwardRef } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { ResourceInfo } from '../DelegationModal/SingleRights/ResourceInfo';
import { SnackbarProvider } from '../../common/Snackbar';

import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  toParty: Party;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource, accessPackage }, ref) => {
    return (
      <Modal.Context>
        <Modal
          ref={ref}
          className={classes.modalDialog}
          backdropClose
        >
          <SnackbarProvider>
            <div className={classes.content}>
              {renderModalContent(toParty, resource, accessPackage)}
            </div>
          </SnackbarProvider>
        </Modal>
      </Modal.Context>
    );
  },
);

const renderModalContent = (
  toParty: Party,
  resource?: ServiceResource,
  accessPackage?: AccessPackage,
) => {
  if (resource) {
    return (
      <ResourceInfo
        resource={resource}
        toParty={toParty}
      />
    );
  } else if (accessPackage) {
    return (
      <AccessPackageInfo
        accessPackage={accessPackage}
        toParty={toParty}
      />
    );
  } else return null;
};

EditModal.displayName = 'EditModal';
