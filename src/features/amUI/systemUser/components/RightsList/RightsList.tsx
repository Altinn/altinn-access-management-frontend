import React, { useRef } from 'react';
import { Avatar, ResourceListItem } from '@altinn/altinn-components';
import { Heading, Modal, Paragraph } from '@digdir/designsystemet-react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import classes from './RightsList.module.css';

interface RightsListProps {
  resources: ServiceResource[];
}

export const RightsList = ({ resources }: RightsListProps): React.ReactNode => {
  return (
    <ul className={classes.unstyledList}>
      {resources.map((resource) => (
        <ResourceInfo
          resource={resource}
          key={resource.identifier}
        />
      ))}
    </ul>
  );
};

interface ResourceInfo {
  resource: ServiceResource;
}
const ResourceInfo = ({ resource }: ResourceInfo): React.ReactNode => {
  const modalRef = useRef<HTMLDialogElement>(null);

  const showResourceInfo = (): void => {
    modalRef.current?.showModal();
  };

  const closeModal = (): void => {
    modalRef.current?.close();
  };

  return (
    <li>
      <ResourceListItem
        id={resource.identifier}
        ownerName={resource.resourceOwnerName}
        resourceName={resource.title}
        ownerLogoUrl={resource.resourceOwnerLogoUrl}
        size='md'
        onClick={showResourceInfo}
      />
      <Modal
        ref={modalRef}
        onClose={closeModal}
        backdropClose
      >
        <div className={classes.resourceInfoHeader}>
          <Avatar
            size='xl'
            type='company'
            imageUrl={resource.resourceOwnerLogoUrl}
            name={resource.resourceOwnerName ?? ''}
          />
          <div>
            <Heading
              level={1}
              size='xs'
            >
              {resource.title}
            </Heading>
            <Paragraph size='xs'>{resource.resourceOwnerName}</Paragraph>
          </div>
        </div>
        <Paragraph size='sm'>{resource.description}</Paragraph>
      </Modal>
    </li>
  );
};
