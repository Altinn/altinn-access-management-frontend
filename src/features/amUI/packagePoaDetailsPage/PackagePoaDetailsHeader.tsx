import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { PackagePoaDetailsHeaderSkeleton } from './PackagePoaDetailsHeaderSkeleton';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

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
  const isSmall = useIsMobileOrSmaller();

  return isLoading ? (
    <PackagePoaDetailsHeaderSkeleton />
  ) : (
    <>
      <div className={classes.headingContainerText}>
        <PackageIcon
          className={classes.packageIcon}
          aria-hidden='true'
        />
        <DsHeading
          level={1}
          data-size={isSmall ? '2xs' : 'sm'}
          className={classes.pageHeading}
        >
          {packageName}
        </DsHeading>
      </div>
      {statusSection}
      <DsParagraph
        variant='long'
        className={classes.pageDescription}
        data-size={isSmall ? 'xs' : 'sm'}
      >
        {packageDescription}
      </DsParagraph>
    </>
  );
};

export default PackagePoaDetailsHeader;
