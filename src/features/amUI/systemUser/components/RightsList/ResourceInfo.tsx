import React, { useRef } from 'react';
import { Modal } from '@digdir/designsystemet-react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './RightsList.module.css';
import { ResourceDetails } from './ResourceDetails';
import { ResourceItem } from './ResourceItem';

interface ResourceInfoProps {
  resource: ServiceResource;
}
export const ResourceInfo = ({ resource }: ResourceInfoProps): React.ReactNode => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const showResourceInfo = (): void => {
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    modalRef.current?.close();
  };

  return (
    <li className={classes.resourceListItem}>
      <ResourceItem
        resource={resource}
        size='md'
        onClick={showResourceInfo}
      />
      <Modal
        ref={modalRef}
        onClose={closeModal}
        backdropClose
      >
        <ResourceDetails resource={resource} />
      </Modal>
    </li>
  );
};
