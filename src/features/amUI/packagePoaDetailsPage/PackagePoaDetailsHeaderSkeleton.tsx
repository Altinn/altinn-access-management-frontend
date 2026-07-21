import React from 'react';
import classes from './PackagePoaDetailsHeader.module.css';
import { DsSkeleton } from '@altinn/altinn-components';

export const PackagePoaDetailsHeaderSkeleton: React.FC = () => (
  <>
    <div className={classes.headingContainerText}>
      <DsSkeleton
        variant='rectangle'
        width={50}
        height={32}
        className={classes.packageIcon}
      />
      <DsSkeleton
        className={`${classes.pageHeading}`}
        height={32}
        width={200}
      />
    </div>
    <DsSkeleton
      className={`${classes.pageDescription}`}
      variant='text'
      width={250}
    />
  </>
);

export default PackagePoaDetailsHeaderSkeleton;
