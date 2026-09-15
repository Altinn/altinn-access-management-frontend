import React from 'react';
import { DsDialog, DsParagraph } from '@altinn/altinn-components';

import { ResourceHeading } from '../DelegationModal/SingleRights/ResourceHeading';

import type { ResourceListItemResource } from './types';
import { extractDescription } from './utils';
import classes from './ResourceDetails.module.css';

interface ResourceDetailsProps {
  resource: ResourceListItemResource | null;
  onClose: () => void;
  providerLogoUrl?: string;
}

export const ResourceDetails = ({ resource, onClose, providerLogoUrl }: ResourceDetailsProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    if (resource) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [resource]);

  const description = resource ? extractDescription(resource) : '';
  const rightDescription =
    resource && 'rightDescription' in resource && typeof resource.rightDescription === 'string'
      ? resource.rightDescription
      : undefined;

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
              providerLogoUrl={providerLogoUrl}
            />
            {description && <DsParagraph data-size='sm'>{description}</DsParagraph>}
            {rightDescription && <DsParagraph data-size='sm'>{rightDescription}</DsParagraph>}
          </div>
        </div>
      )}
    </DsDialog>
  );
};
