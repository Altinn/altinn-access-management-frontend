import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { forwardRef } from 'react';

import { SnackbarProvider } from '../Snackbar';

import { ResourceInfo } from './SingleRights/ResourceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  toParty: Party;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource, accessPackage, role }, ref) => {
    return (
      <Modal.Context>
        <Modal
          ref={ref}
          className={classes.modalDialog}
          backdropClose
        >
          <SnackbarProvider>
            <div className={classes.content}>
              {renderModalContent(toParty, resource, accessPackage, role)}
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
  role?: Role,
) => {
  if (resource) {
    return (
      <ResourceInfo
        resource={resource}
        toParty={toParty}
      />
    );
  }
  if (accessPackage) {
    return (
      <AccessPackageInfo
        accessPackage={accessPackage}
        toParty={toParty}
      />
    );
  }
  if (role) {
    return (
      <RoleInfo
        role={role}
        toParty={toParty}
      />
    );
  }
  return null;
};

EditModal.displayName = 'EditModal';
