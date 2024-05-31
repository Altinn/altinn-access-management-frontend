import { Skeleton, Ingress, Paragraph } from '@digdir/designsystemet-react';
import * as React from 'react';
import cn from 'classnames';

import searchClasses from '../SearchSection/SearchSection.module.css';

import classes from './ChooseServiceSkeleton.module.css';

export const ChooseServiceSkeleton = () => {
  const actionBars = Array(10)
    .fill(1)
    .map((elem, index) => (
      <Skeleton.Rectangle
        key={index}
        height='66px'
      />
    ));

  return (
    <>
      <Ingress spacing>
        <Skeleton.Text />
        <Skeleton.Text width='80%' />
      </Ingress>

      <Skeleton.Rectangle height={'100px'} />

      <div className={searchClasses.searchSection}>
        <div className={searchClasses.searchInputs}>
          <div className={searchClasses.searchField}>
            <Paragraph>
              <Skeleton.Text width='200px' />
            </Paragraph>
            <Skeleton.Rectangle height='42px' />
          </div>
          <Skeleton.Rectangle
            height='30px'
            width='187px'
            className={searchClasses.filter}
          />
        </div>

        <div className={searchClasses.resultCountAndChips}>
          <Paragraph>
            <Skeleton.Text width='200px' />
          </Paragraph>
          {actionBars}
          <div className={cn(searchClasses.pagination, classes.pagination)}>
            <Skeleton.Rectangle
              width='500px'
              height='50px'
            />
          </div>
        </div>
      </div>

      <div className={classes.navButtons}>
        <Skeleton.Rectangle
          width='120px'
          height='44px'
        />
        <Skeleton.Rectangle
          width='120px'
          height='44px'
        />
      </div>
    </>
  );
};
