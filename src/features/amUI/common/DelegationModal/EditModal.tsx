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

import { ResourceInfo } from '../DelegationModal/SingleRights/ResourceInfo';
import { SnackbarProvider } from '../../common/Snackbar';

import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';
import { ActionError } from '@/resources/hooks/useActionError';
import { useDelegationModalContext } from './DelegationModalContext';

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  toParty: Party;
  openWithError?: ActionError | null;
  onClose?: () => void;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource, accessPackage, role, openWithError, onClose }, ref) => {
    const { setActionError, actionError, reset } = useDelegationModalContext();

    useEffect(() => {
      if (!!openWithError) {
        setActionError(openWithError);
      } else {
        setActionError(null);
      }
    }, [openWithError]);

    const onClosing = () => {
      onClose?.();
      reset();
    };

    /* handle closing */
    useEffect(() => {
      const handleClose = () => onClosing?.();

      if (ref && 'current' in ref && ref.current) {
        ref.current.addEventListener('close', handleClose);
      }
      return () => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.removeEventListener('close', handleClose);
        }
      };
    }, [onClosing, ref]);

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
