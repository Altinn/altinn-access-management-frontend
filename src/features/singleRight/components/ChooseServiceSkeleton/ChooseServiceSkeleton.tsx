import { Skeleton } from '@digdir/designsystemet-react';
import * as React from 'react';

import searchClasses from '../SearchSection/SearchSection.module.css';

import classes from './ChooseServiceSkeleton.module.css';

export const ChooseServiceSkeleton = () => {
  return (
    <>
      <div className={classes.infoText}>
        <Skeleton.Text height={'30px'} />
        <Skeleton.Text height={'30px'} />
      </div>

      <Skeleton.Rectangle height={'100px'} />
      <div className={searchClasses.searchSection}>
        <div className={searchClasses.searchInputs}>
          <div className={searchClasses.searchField}>
            <Skeleton.Text width='200px' />
            <Skeleton.Rectangle height='41px' />
          </div>
          <Skeleton.Rectangle
            height='30px'
            width='187px'
            className={searchClasses.filter}
          />
        </div>
      </div>
    </>
  );
};
