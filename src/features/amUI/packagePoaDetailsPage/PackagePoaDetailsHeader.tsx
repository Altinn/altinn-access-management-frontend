import React, { useEffect, useRef } from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { PackagePoaDetailsHeaderSkeleton } from './PackagePoaDetailsHeaderSkeleton';

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
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headerRef.current && !isLoading) {
      headerRef.current.focus();
    }
  }, [isLoading]);

  return isLoading ? (
    <PackagePoaDetailsHeaderSkeleton />
  ) : (
    <>
      <PackageIcon
        className={classes.packageIcon}
        aria-hidden={true}
      />
      <DsHeading
        level={1}
        data-size='lg'
        className={classes.pageHeading}
        ref={headerRef}
        tabIndex={-1}
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
