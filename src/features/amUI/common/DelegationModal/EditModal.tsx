import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';

import { ResourceInfo } from './SingleRights/ResourceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { AccessPackageDelegationCheckProvider } from '../DelegationCheck/AccessPackageDelegationCheckContext';

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
}

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
  onClose?: () => void;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ resource, accessPackage, role, availableActions, openWithError, onClose }, ref) => {
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
      <DsDialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
        onClose={() => {
          onClosing();
        }}
      >
        <div className={classes.content}>
          {renderModalContent(resource, accessPackage, role, availableActions)}
        </div>
      </DsDialog>
    );
  },
);

const renderModalContent = (
  resource?: ServiceResource,
  accessPackage?: AccessPackage,
  role?: Role,
  availableActions?: DelegationAction[],
) => {
  if (resource) {
    return <ResourceInfo resource={resource} />;
  }
  if (accessPackage) {
    return (
      // <AccessPackageDelegationCheckProvider>
        <AccessPackageInfo
          accessPackage={accessPackage}
          availableActions={availableActions}
        />
      // </AccessPackageDelegationCheckProvider>
    );
  }
  if (role) {
    return (
      <RoleInfo
        role={role}
        availableActions={availableActions}
      />
    );
  }
  return null;
};

EditModal.displayName = 'EditModal';
