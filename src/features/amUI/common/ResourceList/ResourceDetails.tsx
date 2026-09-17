import React from 'react';
import { Avatar, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import classes from './ResourceDetails.module.css';

export interface ResourceDetailsContentProps {
  resource: ServiceResource;
}

export const ResourceDetailsContent = ({ resource }: ResourceDetailsContentProps) => {
  return (
    <div className={classes.dialogContentWrapper}>
      <div className={classes.resourceContent}>
        <div className={classes.headerRow}>
          <div className={classes.resourceIcon}>
            <Avatar
              type='company'
              imageUrl={resource.resourceOwnerLogoUrl}
              name={resource.resourceOwnerName}
            />
          </div>
          <div>
            <DsHeading
              level={2}
              data-size='xs'
            >
              {resource.title}
            </DsHeading>
            {resource.resourceOwnerName && (
              <DsParagraph data-size='xs'>{resource.resourceOwnerName}</DsParagraph>
            )}
          </div>
        </div>
        {resource.description && <DsParagraph data-size='sm'>{resource.description}</DsParagraph>}
        {resource.rightDescription && (
          <DsParagraph data-size='sm'>{resource.rightDescription}</DsParagraph>
        )}
      </div>
    </div>
  );
};

interface ResourceDetailsProps {
  resource: ServiceResource | null;
  onClose: () => void;
  renderContent?: (resource: ServiceResource) => React.ReactNode;
}

export const ResourceDetails = ({ resource, onClose, renderContent }: ResourceDetailsProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (resource) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [resource]);

  return (
    <DsDialog
      ref={dialogRef}
      onClose={onClose}
      closedby='any'
    >
      {resource && (renderContent?.(resource) ?? <ResourceDetailsContent resource={resource} />)}
    </DsDialog>
  );
};
