import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ActionError } from '@/resources/hooks/useActionError';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Role } from '@/rtk/features/roleApi';
import type { DialogLookup } from '@/rtk/features/instanceApi';
import { ResourceInfo } from './SingleRights/ResourceInfo';
import { InstanceInfo } from './Instance/InstanceInfo';
import classes from './DelegationModal.module.css';
import { AccessPackageInfo } from './AccessPackages/AccessPackageInfo';
import { RoleInfo } from './Role/RoleInfo';
import { useDelegationModalContext } from './DelegationModalContext';
import { ScopeInfo } from '../../maskinporten/ScopeInfo';

export interface DelegationRecipient {
  partyUuid: string;
  name: string;
  partyTypeName: string;
}

export enum DelegationAction {
  DELEGATE = 'DELEGATE',
  REQUEST = 'REQUEST',
  REVOKE = 'REVOKE',
  APPROVE = 'APPROVE',
}

export interface InstanceData {
  instanceUrn: string;
  dialogLookup?: DialogLookup;
}

export interface EditModalProps {
  resource?: ServiceResource;
  maskinportenScope?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  instance?: InstanceData;
  toParty?: DelegationRecipient;
  availableActions?: DelegationAction[];
  openWithError?: ActionError | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  (
    {
      resource,
      maskinportenScope,
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

    useEffect(() => {
      if (openWithError) {
        setActionError(openWithError);
      } else {
        setActionError(null);
      }
    }, [openWithError, setActionError]);

    return (
      <DsDialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
        onClose={() => {
          onClose?.();
          reset();
        }}
      >
        <div className={classes.content}>
          {renderModalContent({
            resource,
            maskinportenScope,
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
  maskinportenScope,
  accessPackage,
  role,
  instance,
  toParty,
  availableActions,
  onSuccess,
}: {
  resource?: ServiceResource;
  maskinportenScope?: ServiceResource;
  accessPackage?: AccessPackage;
  role?: Role;
  instance?: InstanceData;
  toParty?: DelegationRecipient;
  availableActions?: DelegationAction[];
  onSuccess?: () => void;
}) => {
  if (maskinportenScope) {
    return (
      <ScopeInfo
        resource={maskinportenScope}
        availableActions={availableActions}
      />
    );
  }
  if (resource && instance) {
    return (
      <InstanceInfo
        resource={resource}
        instanceUrn={instance.instanceUrn}
        dialogLookup={instance.dialogLookup}
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
