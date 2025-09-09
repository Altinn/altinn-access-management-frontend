import React from 'react';
import { Avatar, DsHeading, DsParagraph, DsDialog, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import type { PackageResource } from '@/rtk/features/accessPackageApi';
import classes from './PackageResourceDetails.module.css';

interface PackageResourceDetailsProps {
  resource: PackageResource | null;
  onClose: () => void;
  providerLogoUrl?: string;
}

export const PackageResourceDetails = ({
  resource,
  onClose,
  providerLogoUrl,
}: PackageResourceDetailsProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (resource) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [resource]);

  const ownerName = resource?.provider?.name || resource?.resourceOwnerName;

  return (
    <DsDialog
      ref={dialogRef}
      onClose={onClose}
      closedby='any'
    >
      {resource && (
        <div className={classes.dialogContentWrapper}>
          <div className={classes.resourceContent}>
            <div className={classes.headerRow}>
              <Avatar
                size='xl'
                type='company'
                imageUrl={providerLogoUrl}
                imageUrlAlt={ownerName}
                name={ownerName ?? ''}
              />
              <div>
                <DsHeading
                  level={1}
                  data-size='xs'
                >
                  {resource.title || resource.name}
                </DsHeading>
                {ownerName && <DsParagraph data-size='xs'>{ownerName}</DsParagraph>}
              </div>
            </div>
            {resource.description && (
              <DsParagraph data-size='sm'>{resource.description}</DsParagraph>
            )}
          </div>
        </div>
      )}
    </DsDialog>
  );
};
