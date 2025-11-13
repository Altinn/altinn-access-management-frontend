import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { DsDialog, DsSpinner } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';

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
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
  onClose?: () => void;
  isLoading?: boolean;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ resource, accessPackage, role, availableActions, openWithError, onClose, isLoading }, ref) => {
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
          {renderModalContent(resource, accessPackage, role, availableActions, isLoading)}
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
  isLoading?: boolean,
) => {
  if (isLoading) {
    return (
      <div className={classes.spinnerWrapper}>
        <DsSpinner
          data-size='lg'
          aria-live='polite'
          aria-label='Loading'
        />
      </div>
    );
  }
  if (resource) {
    return <ResourceInfo resource={resource} />;
  }
  if (accessPackage) {
    return (
      <AccessPackageInfo
        accessPackage={accessPackage}
        availableActions={availableActions}
      />
    );
  }
  if (role) {
    return <RoleInfo role={role} />;
  }
  return null;
};

EditModal.displayName = 'EditModal';
