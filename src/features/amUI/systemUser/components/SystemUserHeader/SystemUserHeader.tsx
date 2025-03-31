import React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { TenancyIcon } from '@navikt/aksel-icons';

import classes from './SystemUserHeader.module.css';

interface SystemUserHeaderProps {
  title: string;
  subTitle?: string;
}

export const SystemUserHeader = ({ title, subTitle }: SystemUserHeaderProps): React.ReactNode => {
  return (
    <div className={classes.systemUserDetailsHeader}>
      <TenancyIcon fontSize={60} />
      <div>
        <Heading
          level={1}
          data-size='sm'
        >
          {title}
        </Heading>
        {subTitle && <Paragraph>{subTitle}</Paragraph>}
      </div>
    </div>
  );
};
