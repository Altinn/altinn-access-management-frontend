import React from 'react';
import { Avatar, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import type { ResourceListItemResource } from './types';
import classes from './ResourceDetails.module.css';

export interface ResourceDetailsContentProps {
  resource: ResourceListItemResource;
  providerLogoUrl?: string;
}

const isServiceResource = (r: ResourceListItemResource): r is ServiceResource =>
  'rightDescription' in r;

export const ResourceDetailsContent = ({
  resource,
  providerLogoUrl,
}: ResourceDetailsContentProps) => {
  const rightDescription = isServiceResource(resource) ? resource.rightDescription : undefined;

  return (
    <div className={classes.dialogContentWrapper}>
      <div className={classes.resourceContent}>
        <div className={classes.headerRow}>
          <div className={classes.resourceIcon}>
            <Avatar
              type='company'
              imageUrl={providerLogoUrl ?? resource.resourceOwnerLogoUrl}
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
