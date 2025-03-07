import * as React from 'react';
import { Dialog } from '@digdir/designsystemet-react';
import { forwardRef, useEffect } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { SnackbarProvider } from '../Snackbar';

import { ResourceInfo } from './SingleRights/ResourceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';
import { useDelegationModalContext } from './DelegationModalContext';

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
  openWithError?: ActionError | null;
  onClose?: () => void;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  (
    {
      toPartyUuid,
      fromPartyUuid,
      resource,
      accessPackage,
      role,
      availableActions,
      openWithError,
      onClose,
    },
    ref,
  ) => {
    const { setActionError, reset } = useDelegationModalContext();

    const onClosing = () => {
      onClose?.();
      reset();
    };

    useEffect(() => {
      if (openWithError) {
        setActionError(openWithError);
      } else {
        setActionError(null);
      }
    }, [openWithError, setActionError]);

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
      <Dialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
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
      </Dialog>
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
