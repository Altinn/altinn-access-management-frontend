import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { forwardRef, useEffect } from 'react';

import { SnackbarProvider } from '../Snackbar';

import { ResourceInfo } from './SingleRights/ResourceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookupApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
}

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  toParty: Party;
  availableActions?: DelegationAction[];
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource, accessPackage, role, availableActions }, ref) => {
    return (
      <Modal.Context>
        <Modal
          ref={ref}
          className={classes.modalDialog}
          backdropClose
          onClose={() => {
            onClosing();
          }}
        >
          <SnackbarProvider>
            <div className={classes.content}>
              {renderModalContent(toParty, resource, accessPackage, role, availableActions)}
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
  availableActions?: DelegationAction[],
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
        availableActions={availableActions}
      />
    );
  }
  if (role) {
    return (
      <RoleInfo
        role={role}
        toParty={toParty}
        availableActions={availableActions}
      />
    );
  }
  return null;
};

EditModal.displayName = 'EditModal';
