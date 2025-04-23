import React from 'react';
import { TenancyIcon } from '@navikt/aksel-icons';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import classes from './SystemUserHeader.module.css';

interface SystemUserHeaderProps {
  title: string;
  subTitle?: string;
}

export const SystemUserHeader = ({ title, subTitle }: SystemUserHeaderProps): React.ReactNode => {
  return (
    <div className={classes.systemUserDetailsHeader}>
      <TenancyIcon fontSize={60} />
      <div className={classes.headingContainer}>
        <DsHeading
          level={1}
          data-size='sm'
        >
          {title}
        </DsHeading>
        {subTitle && <DsParagraph data-size='xs'>for {subTitle}</DsParagraph>}
      </div>
    </div>
  );
};
