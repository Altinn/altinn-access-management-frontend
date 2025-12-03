import React from 'react';
import { TenancyIcon } from '@navikt/aksel-icons';
import { DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';

import classes from './SystemUserHeader.module.css';

interface SystemUserHeaderProps {
  title: string;
  subTitle?: string;
  isLoading?: boolean;
}

export const SystemUserHeader = ({
  title,
  subTitle,
  isLoading,
}: SystemUserHeaderProps): React.ReactNode => {
  return (
    <div className={classes.systemUserDetailsHeader}>
      <TenancyIcon fontSize={60} />
      <div className={classes.headingContainer}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {isLoading ? (
            <DsSkeleton
              variant='text'
              width={20}
            />
          ) : (
            title
          )}
        </DsHeading>
        {isLoading && (
          <DsSkeleton
            variant='text'
            width={20}
          />
        )}
        {subTitle && <DsParagraph data-size='xs'>for {subTitle}</DsParagraph>}
      </div>
    </div>
  );
};
