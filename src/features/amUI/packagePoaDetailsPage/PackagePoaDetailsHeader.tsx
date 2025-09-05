import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { Avatar, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { PackageIcon } from '@navikt/aksel-icons';
import { PartyType } from '@/rtk/features/userInfoApi';
import { PackagePoaDetailsHeaderSkeleton } from './PackagePoaDetailsHeaderSkeleton';

interface PackagePoaDetailsHeaderProps {
  packageName?: string;
  packageDescription?: string;
  isLoading?: boolean;
}

export const PackagePoaDetailsHeader: React.FC<PackagePoaDetailsHeaderProps> = ({
  packageName = '',
  packageDescription = '',
  isLoading = false,
}) => {
  return isLoading ? (
    <PackagePoaDetailsHeaderSkeleton />
  ) : (
    <>
      <PackageIcon className={classes.packageIcon} />
      <DsHeading
        level={1}
        data-size='lg'
        className={classes.pageHeading}
      >
        {packageName}
      </DsHeading>
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
