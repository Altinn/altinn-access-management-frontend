/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { ResourceListItem } from '@altinn/altinn-components';
import type { FC } from 'react';
import { useRef } from 'react';

import { type ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { type Party } from '@/rtk/features/lookupApi';

import { EditModal } from '../../common/DelegationModal/EditModal';

import { DeleteResourceButton } from './DeleteResourceButton';
import classes from './SingleRightsSection.module.css';

interface SingleRightItemProps {
  resource: ServiceResource;
  toParty: Party;
}

const SingleRightItem: FC<SingleRightItemProps> = ({ resource, toParty }) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <li className={classes.singleRightItem}>
        <ResourceListItem
          resourceName={resource.title}
          ownerName={resource.resourceOwnerName ?? ''}
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
