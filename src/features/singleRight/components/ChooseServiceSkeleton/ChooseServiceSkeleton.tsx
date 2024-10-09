import { Skeleton, Ingress, Paragraph } from '@digdir/designsystemet-react';
import * as React from 'react';
import cn from 'classnames';

import searchClasses from '../SearchSection/SearchSection.module.css';

import classes from './ChooseServiceSkeleton.module.css';

export const ChooseServiceSkeleton = () => {
  const actionBars = Array(10)
    .fill(1)
    .map((elem, index) => (
      <Skeleton
        variant='rectangle'
        key={index}
        height='66px'
      />
    ));

  return (
    <>
      <Ingress spacing>
        <Skeleton variant='text' />
        <Skeleton
          variant='text'
          width='80%'
        />
      </Ingress>

      <Skeleton
        variant='rectangle'
        height={'100px'}
      />

      <div className={searchClasses.searchSection}>
        <div className={searchClasses.searchInputs}>
          <div className={searchClasses.searchField}>
            <Paragraph>
              <Skeleton
                variant='text'
                width='200px'
              />
            </Paragraph>
            <Skeleton
              variant='rectangle'
              height='42px'
            />
          </div>
          <Skeleton
            variant='rectangle'
            height='30px'
            width='187px'
            className={searchClasses.filter}
          />
        </div>

        <div className={searchClasses.resultCountAndChips}>
          <Paragraph>
            <Skeleton
              variant='text'
              width='200px'
            />
          </Paragraph>
          {actionBars}
          <div className={cn(searchClasses.pagination, classes.pagination)}>
            <Skeleton
              variant='rectangle'
              width='500px'
              height='50px'
            />
          </div>
        </div>
      </div>

      <div className={classes.navButtons}>
        <Skeleton
          variant='rectangle'
          width='120px'
          height='44px'
        />
        <Skeleton
          variant='rectangle'
          width='120px'
          height='44px'
        />
      </div>
    </>
  );
};
