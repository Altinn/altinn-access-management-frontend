import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { forwardRef, useEffect } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';

import { SnackbarProvider } from '../Snackbar';

import { ResourceInfo } from './SingleRights/ResourceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
}

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  toPartyUuid: string;
  fromPartyUuid: string;
  availableActions?: DelegationAction[];
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toPartyUuid, fromPartyUuid, resource, accessPackage, role, availableActions }, ref) => {
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
              {renderModalContent(
                toPartyUuid,
                fromPartyUuid,
                resource,
                accessPackage,
                role,
                availableActions,
              )}
            </div>
          </SnackbarProvider>
        </Modal>
      </Modal.Context>
    );
  },
);

const renderModalContent = (
  toPartyUuid: string,
  fromPartyUuid: string,
  resource?: ServiceResource,
  accessPackage?: AccessPackage,
  role?: Role,
  availableActions?: DelegationAction[],
) => {
  if (resource) {
    return (
      <ResourceInfo
        resource={resource}
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
      />
    );
  }
  if (accessPackage) {
    return (
      <AccessPackageInfo
        accessPackage={accessPackage}
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
        availableActions={availableActions}
      />
    );
  }
  if (role) {
    return (
      <RoleInfo
        role={role}
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
        availableActions={availableActions}
      />
    );
  }
  return null;
};

EditModal.displayName = 'EditModal';
