import React from 'react';
import { DsDialog, DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { ResourceHeading } from '../DelegationModal/SingleRights/ResourceHeading';

import classes from './ResourceDetails.module.css';

interface ResourceDetailsProps {
  resource: ServiceResource | null;
  onClose: () => void;
}

export const ResourceDetails = ({ resource, onClose }: ResourceDetailsProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (resource) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [resource]);

  const description = resource?.description;
  const rightDescription = resource?.rightDescription;

  return (
    <DsDialog
      ref={dialogRef}
      onClose={onClose}
      closedby='any'
    >
      {resource && (
        <div className={classes.dialogContentWrapper}>
          <div className={classes.resourceContent}>
            <ResourceHeading
              resource={resource}
              level={2}
            />
            {description && <DsParagraph data-size='sm'>{description}</DsParagraph>}
            {rightDescription && <DsParagraph data-size='sm'>{rightDescription}</DsParagraph>}
          </div>
        </div>
      )}
    </DsDialog>
  );
};
