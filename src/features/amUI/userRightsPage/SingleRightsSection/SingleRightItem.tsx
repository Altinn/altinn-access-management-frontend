/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useRef } from 'react';

import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { ListItem } from '@/features/amUI/common/List';
import { type Party } from '@/rtk/features/lookup/lookupApi';

import { EditModal } from '../DelegationModal/EditModal';

import classes from './SingleRightsSection.module.css';
import { DeleteResourceButton } from './DeleteResourceButton';

interface SingleRightItemProps {
  resource: ServiceResource;
  toParty: Party;
}

const SingleRightItem: React.FC<SingleRightItemProps> = ({ resource, toParty }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <ListItem
        onClick={() => modalRef.current?.showModal()}
        className={classes.singleRightItem}
      >
        <Avatar
          size='md'
          profile='serviceOwner'
          className={classes.icon}
          logoUrl={resource.resourceOwnerLogoUrl}
          name={resource.resourceOwnerName}
        />
        <div className={classes.title}>{resource.title}</div>
        <div className={classes.resourceOwnerName}>{resource.resourceOwnerName}</div>
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
      </ListItem>
      <EditModal
        ref={modalRef}
        toParty={toParty}
        resource={resource}
      ></EditModal>
    </>
  );
};

export default SingleRightItem;
