import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';
import type { Party } from '@/rtk/features/lookupApi';

type ToParty = Pick<Party, 'partyUuid' | 'name' | 'partyTypeName'>;

import { ResourceInfo } from './SingleRights/ResourceInfo';
import { InstanceInfo } from './Instance/InstanceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';
import { useDelegationModalContext } from './DelegationModalContext';

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
}

export interface InstanceData {
  instanceUrn: string;
  instanceName?: string;
}

export interface EditModalProps {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  instance?: InstanceData;
  toParty?: ToParty;
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  (
    {
      resource,
      accessPackage,
      role,
      instance,
      toParty,
      availableActions,
      openWithError,
      onSuccess,
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
      <DsDialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
        onClose={() => {
          onClosing();
        }}
      >
        <div className={classes.content}>
          {renderModalContent({
            resource,
            accessPackage,
            role,
            instance,
            toParty,
            availableActions,
            onSuccess,
          })}
        </div>
      </DsDialog>
    );
  },
);

const renderModalContent = ({
  resource,
  accessPackage,
  role,
  instance,
  toParty,
  availableActions,
  onSuccess,
}: {
  resource?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  instance?: InstanceData;
  toParty?: ToParty;
  availableActions?: DelegationAction[];
  onSuccess?: () => void;
}) => {
  if (resource && instance) {
    return (
      <InstanceInfo
        resource={resource}
        instanceUrn={instance.instanceUrn}
        instanceName={instance.instanceName}
        toParty={toParty}
        availableActions={availableActions}
        onSuccess={onSuccess}
      />
    );
  }
  if (resource) {
    return (
      <ResourceInfo
        resource={resource}
        availableActions={availableActions}
      />
    );
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
