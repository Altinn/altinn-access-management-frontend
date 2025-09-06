import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { DsSkeleton } from '@altinn/altinn-components';

export const PackagePoaDetailsHeaderSkeleton: React.FC = () => (
  <>
    <DsSkeleton
      variant='rectangle'
      width={50}
      height={50}
      className={classes.packageIcon}
    />
    <DsSkeleton
      className={`${classes.pageHeading}`}
      variant='rectangle'
      height={50}
    />
    <DsSkeleton
      className={`${classes.pageDescription}`}
      variant='text'
      width={250}
    />
  </>
);

export default PackagePoaDetailsHeaderSkeleton;
