import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { PackagePoaDetailsHeaderSkeleton } from './PackagePoaDetailsHeaderSkeleton';

// Durable anchor that focus falls back to when a user row is gone (e.g. after a revoke in the users tab).
export const PACKAGE_POA_HEADING_ID = 'package_poa_heading';

interface PackagePoaDetailsHeaderProps {
  packageName?: string;
  packageDescription?: string;
  isLoading?: boolean;
  statusSection?: React.ReactNode;
}

export const PackagePoaDetailsHeader: React.FC<PackagePoaDetailsHeaderProps> = ({
  packageName = '',
  packageDescription = '',
  isLoading = false,
  statusSection,
}) => {
  return isLoading ? (
    <PackagePoaDetailsHeaderSkeleton />
  ) : (
    <>
      <PackageIcon
        className={classes.packageIcon}
        aria-hidden='true'
      />
      <DsHeading
        level={1}
        data-size='lg'
        className={classes.pageHeading}
        id={PACKAGE_POA_HEADING_ID}
      >
        {packageName}
      </DsHeading>
      {statusSection && <div className={classes.statusSection}>{statusSection}</div>}
      <DsParagraph
        variant='long'
        className={classes.pageDescription}
      >
        {packageDescription}
      </DsParagraph>
    </>
  );
};

export default PackagePoaDetailsHeader;
