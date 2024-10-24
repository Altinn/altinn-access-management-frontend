import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { forwardRef } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';

import { ResourceInfo } from '../DelegationModal/ResourceInfo';

import classes from './DelegationModal.module.css';

export interface EditModalProps {
  resource: ServiceResource;
  toParty: Party;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource }, ref) => {
    return (
      <Modal.Context>
        <Modal
          ref={ref}
          className={classes.modalDialog}
          backdropClose
        >
          <div className={classes.content}>
            <ResourceInfo
              resource={resource}
              toParty={toParty}
            />
          </div>
        </Modal>
      </Modal.Context>
    );
  },
);

EditModal.displayName = 'EditModal';
