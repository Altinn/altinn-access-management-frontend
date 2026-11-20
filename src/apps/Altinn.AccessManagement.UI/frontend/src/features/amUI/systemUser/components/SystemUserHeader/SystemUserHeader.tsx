import React from 'react';
import { Avatar, DsHeading, DsParagraph, DsSkeleton } from '@altinn/altinn-components';

import classes from './SystemUserHeader.module.css';

interface SystemUserHeaderProps {
  title: string;
  avatarTitle?: string;
  subTitle?: string;
  isLoading?: boolean;
}

export const SystemUserHeader = ({
  title,
  avatarTitle,
  subTitle,
  isLoading,
}: SystemUserHeaderProps): React.ReactNode => {
  return (
    <div className={classes.systemUserDetailsHeader}>
      <Avatar
        type='system'
        className={classes.systemUserDetailsHeaderAvatar}
        name={avatarTitle || title}
      />
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
