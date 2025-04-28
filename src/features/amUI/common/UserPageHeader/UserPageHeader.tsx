import { Avatar, DsParagraph, DsHeading } from '@altinn/altinn-components';
import type { ReactNode } from 'react';
import { ArrowRightIcon } from '@navikt/aksel-icons';

import { PartyType } from '@/rtk/features/userInfoApi';

import classes from './UserPageHeader.module.css';

interface UserPageHeaderProps {
  userName?: string;
  userType?: PartyType;
  subHeading?: string;
  roles?: ReactNode;
  secondaryAvatarName?: string;
  secondaryAvatarType?: PartyType;
}

export const UserPageHeader = ({
  userName,
  userType,
  subHeading,
  roles,
  secondaryAvatarName,
  secondaryAvatarType,
}: UserPageHeaderProps) => {
  const avatar = () => {
    if (secondaryAvatarName && secondaryAvatarType) {
      return (
        <div className={classes.avatar}>
          <Avatar
            name={userName || ''}
            size={'lg'}
            type={userType === PartyType.Organization ? 'company' : 'person'}
          />
          <ArrowRightIcon style={{ fontSize: '1.5rem' }} />
          <Avatar
            name={secondaryAvatarName}
            size={'lg'}
            type={secondaryAvatarType === PartyType.Organization ? 'company' : 'person'}
          />
        </div>
      );
    }
    return (
      <Avatar
        className={classes.avatar}
        name={userName || ''}
        size={'lg'}
        type={userType === PartyType.Organization ? 'company' : 'person'}
      />
    );
  };

  return (
    <div className={classes.headingContainer}>
      {avatar()}
      <DsHeading
        level={1}
        data-size='sm'
        className={classes.heading}
      >
        {userName}
      </DsHeading>
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
