import * as React from 'react';
import cn from 'classnames';
import { DsSkeleton, DsParagraph } from '@altinn/altinn-components';

import searchClasses from '../SearchSection/SearchSection.module.css';

import classes from './ChooseServiceSkeleton.module.css';

export const ChooseServiceSkeleton = () => {
  const actionBars = Array(10)
    .fill(1)
    .map((elem, index) => (
      <DsSkeleton
        variant='rectangle'
        key={index}
        height='66px'
      />
    ));

  return (
    <>
      <DsParagraph variant='long'>
        <DsSkeleton variant='text' />
        <DsSkeleton
          variant='text'
          width='80%'
        />
      </DsParagraph>

      <DsSkeleton
        variant='rectangle'
        height={'100px'}
      />

      <div className={searchClasses.searchSection}>
        <div className={searchClasses.searchInputs}>
          <div className={searchClasses.searchField}>
            <DsParagraph>
              <DsSkeleton
                variant='text'
                width='200px'
              />
            </DsParagraph>
            <DsSkeleton
              variant='rectangle'
              height='42px'
            />
          </div>
          <DsSkeleton
            variant='rectangle'
            height='30px'
            width='187px'
            className={searchClasses.filter}
          />
        </div>

        <div className={searchClasses.resultCountAndChips}>
          <DsParagraph>
            <DsSkeleton
              variant='text'
              width='200px'
            />
          </DsParagraph>
          {actionBars}
          <div className={cn(searchClasses.pagination, classes.pagination)}>
            <DsSkeleton
              variant='rectangle'
              width='500px'
              height='50px'
            />
          </div>
        </div>
      </div>

      <div className={classes.navButtons}>
        <DsSkeleton
          variant='rectangle'
          width='120px'
          height='44px'
        />
        <DsSkeleton
          variant='rectangle'
          width='120px'
          height='44px'
        />
      </div>
    </>
  );
};
