/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useRef } from 'react';

//import { ResourceListItem } from '@altinn/altinn-components';
import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { type Party } from '@/rtk/features/lookupApi';

import { ResourceListItem } from '../../../../../../altinn-components/lib/components';
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
        <ResourceListItem
          resourceName={resource.title}
          ownerName={resource.resourceOwnerName}
          ownerLogoUrl={resource.resourceOwnerLogoUrl}
          id={resource.identifier}
          size='lg'
          as='button'
          onClick={() => modalRef.current?.showModal()}
          controls={
            <div className={classes.actions}>
              <DeleteResourceButton
                resource={resource}
                toParty={toParty}
              />
            </div>
          }
        />
        <div
          className={classes.action}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        ></div>
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
