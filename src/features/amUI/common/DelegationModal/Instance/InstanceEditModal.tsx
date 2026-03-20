import * as React from 'react';
import { forwardRef } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { DelegationAction } from '../EditModal';
import { InstanceInfo } from './InstanceInfo';

import classes from '../DelegationModal.module.css';

export interface InstanceEditModalProps {
  resource?: ServiceResource;
  instanceUrn?: string;
  instanceName?: string;
  toPartyUuid?: string;
  toPartyName?: string;
  availableActions?: DelegationAction[];
  openWithError?: 'delegate' | 'revoke' | 'edit' | null;
  onClose?: () => void;
}

export const InstanceEditModal = forwardRef<HTMLDialogElement, InstanceEditModalProps>(
  (
    {
      resource,
      instanceUrn,
      instanceName,
      toPartyUuid,
      toPartyName,
      availableActions,
      openWithError,
      onClose,
    },
    ref,
  ) => {
    return (
      <DsDialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
        onClose={onClose}
      >
        <div className={classes.content}>
          {resource && instanceUrn && (
            <InstanceInfo
              resource={resource}
              instanceUrn={instanceUrn}
              instanceName={instanceName}
              toPartyUuid={toPartyUuid}
              toPartyName={toPartyName}
              availableActions={availableActions}
              openWithError={openWithError}
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

InstanceEditModal.displayName = 'InstanceEditModal';
