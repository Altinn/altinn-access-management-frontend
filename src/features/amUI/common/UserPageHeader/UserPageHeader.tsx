import { Avatar, DsParagraph, Heading } from '@altinn/altinn-components';
import type { ReactNode } from 'react';

import classes from './UserPageHeader.module.css';

import { PartyType } from '@/rtk/features/userInfoApi';

interface UserPageHeaderProps {
  userName?: string;
  userType?: PartyType;
  subHeading?: string;
  roles?: ReactNode;
}

export const UserPageHeader = ({ userName, userType, subHeading, roles }: UserPageHeaderProps) => {
  return (
    <div className={classes.headingContainer}>
      <Avatar
        className={classes.avatar}
        name={userName || ''}
        size={'lg'}
        type={userType === PartyType.Organization ? 'company' : 'person'}
      />
      <Heading
        as='h1'
        data-size='sm'
        className={classes.heading}
      >
        {userName}
      </Heading>
      {subHeading && (
        <DsParagraph
          className={classes.subheading}
          data-size='xs'
        >
          {subHeading}
        </DsParagraph>
      )}
      {roles && <div className={classes.userRoles}>{roles}</div>}
    </div>
  );
};
