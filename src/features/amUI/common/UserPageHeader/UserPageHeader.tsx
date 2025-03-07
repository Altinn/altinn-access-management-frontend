import { Avatar } from '@altinn/altinn-components';
import type { ReactNode } from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

import type { PartyType } from '@/rtk/features/userInfoApi';

import classes from './UserPageHeader.module.css';

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
        type={userType === 'Organization' ? 'company' : 'person'}
      />
      <Heading
        level={1}
        data-size='sm'
        className={classes.heading}
      >
        {userName}
      </Heading>
      {subHeading && (
        <Paragraph
          className={classes.subheading}
          data-size='xs'
        >
          {subHeading}
        </Paragraph>
      )}
      {roles && <div className={classes.userRoles}>{roles}</div>}
    </div>
  );
};
