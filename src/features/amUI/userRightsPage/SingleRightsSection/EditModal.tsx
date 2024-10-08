import * as React from 'react';
import { Modal } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { forwardRef } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';

import { ResourceInfo } from '../DelegationModal/ResourceInfo';

import classes from './EditModal.module.css';

export interface EditModalProps {
  resource?: ServiceResource;
  toParty: Party;
}

export const EditModal = forwardRef<HTMLDialogElement, EditModalProps>(
  ({ toParty, resource }, ref) => {
    const { t } = useTranslation();

    const closeModal = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    };

    return (
      <Modal.Root>
        <Modal.Dialog
          ref={ref}
          className={classes.modalDialog}
          onInteractOutside={closeModal}
        >
          <Modal.Header></Modal.Header>
          <Modal.Content className={classes.content}>
            <ResourceInfo
              resource={resource}
              toParty={toParty}
              onDelegate={closeModal}
            />
          </Modal.Content>
        </Modal.Dialog>
      </Modal.Root>
    );
  },
);

EditModal.displayName = 'EditModal';
