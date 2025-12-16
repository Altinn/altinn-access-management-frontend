import React from 'react';
import { Avatar, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import type { ResourceListItemResource } from './types';
import classes from './ResourceDetails.module.css';

export interface ResourceDetailsContentProps {
  resource: ResourceListItemResource;
  providerLogoUrl?: string;
}

export const ResourceDetailsContent = ({
  resource,
  providerLogoUrl,
}: ResourceDetailsContentProps) => {
  const ownerName =
    ('provider' in resource && resource.provider?.name) ||
    ('resourceOwnerName' in resource ? resource.resourceOwnerName : undefined);

  const title =
    ('title' in resource && resource.title) ||
    ('name' in resource && resource.name) ||
    ('resourceName' in resource ? (resource as { resourceName?: string }).resourceName : undefined);

  const serviceDescription =
    'description' in resource && resource.description
      ? (resource as { description?: string }).description
      : undefined;

  const rightDescription =
    'rightDescription' in resource
      ? (resource as { rightDescription?: string }).rightDescription
      : undefined;

  return (
    <div className={classes.dialogContentWrapper}>
      <div className={classes.resourceContent}>
        <div className={classes.headerRow}>
          <div className={classes.resourceIcon}>
            <Avatar
              type='company'
              imageUrl={providerLogoUrl ?? resource.resourceOwnerLogoUrl}
              name={resource.resourceOwnerName ?? ''}
            />
          </div>
          <div>
            <DsHeading
              level={2}
              data-size='xs'
            >
              {title}
            </DsHeading>
            {ownerName && <DsParagraph data-size='xs'>{ownerName}</DsParagraph>}
          </div>
        </div>
        {serviceDescription && <DsParagraph data-size='sm'>{serviceDescription}</DsParagraph>}
        {rightDescription && <DsParagraph data-size='sm'>{rightDescription}</DsParagraph>}
      </div>
    </div>
  );
};

interface ResourceDetailsProps {
  resource: ResourceListItemResource | null;
  onClose: () => void;
  providerLogoUrl?: string;
  renderContent?: (resource: ResourceListItemResource, providerLogoUrl?: string) => React.ReactNode;
}

export const ResourceDetails = ({
  resource,
  onClose,
  providerLogoUrl,
  renderContent,
}: ResourceDetailsProps) => {
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
      {resource &&
        (renderContent?.(resource, providerLogoUrl) ?? (
          <ResourceDetailsContent
            resource={resource}
            providerLogoUrl={providerLogoUrl}
          />
        ))}
    </DsDialog>
  );
};
