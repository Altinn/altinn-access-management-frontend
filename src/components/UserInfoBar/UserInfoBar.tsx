import * as React from 'react';
import { Buildings3FillIcon, PersonCircleFillIcon } from '@navikt/aksel-icons';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';
import { useGetReporteeQuery, useGetUserProfileQuery } from '@/rtk/features/userInfoApi';

import classes from './UserInfoBar.module.css';

export const UserInfoBar = () => {
  const { data: userData } = useGetUserProfileQuery();
  const { data: reporteeData } = useGetReporteeQuery();

  const isSelf = reporteeData?.partyUuid === userData?.uuid;
  const isPerson = reporteeData?.type === 'Person';

  return (
    <header className={classes.userInfoBar}>
      <div>
        <AltinnTextLogo title='Altinn' />
      </div>
      <div className={classes.userInfoContent}>
        <div className={classes.userInfoTextContainer}>
          {userData?.name && <span className={classes.userInfoText}>{userData.name}</span>}
          {!isSelf && reporteeData?.name && (
            <span className={classes.userInfoText}>for {reporteeData.name}</span>
          )}
        </div>
        {isPerson ? (
          <PersonCircleFillIcon className={classes.companyIconContainer} />
        ) : (
          <Buildings3FillIcon className={classes.companyIconContainer} />
        )}
      </div>
    </header>
  );
};
