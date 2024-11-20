/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useRef } from 'react';
import { ListItem } from '@altinn/altinn-components';

import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { type Party } from '@/rtk/features/lookupApi';

import { EditModal } from '../DelegationModal/EditModal';

import { DeleteResourceButton } from './DeleteResourceButton';
import classes from './SingleRightsSection.module.css';

interface SingleRightItemProps {
  resource: ServiceResource;
  toParty: Party;
}

const SingleRightItem: React.FC<SingleRightItemProps> = ({ resource, toParty }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <li className={classes.singleRightItem}>
        <ListItem
          id={resource.identifier}
          title={resource.title}
          description={resource.resourceOwnerName}
          size='lg'
          avatar={{
            type: 'company',
            imageUrl: resource.resourceOwnerLogoUrl,
            name: resource.resourceOwnerName,
          }}
          onClick={() => modalRef.current?.showModal()}
        />
        <div
          className={classes.action}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        >
          <DeleteResourceButton
            resource={resource}
            toParty={toParty}
          />
        </div>
      </li>
      <EditModal
        ref={modalRef}
        toParty={toParty}
        resource={resource}
      ></EditModal>
    </>
  );
};

export default SingleRightItem;
