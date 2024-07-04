import * as React from 'react';
import { Buildings3FillIcon } from '@navikt/aksel-icons';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';
import classes from './UserInfoBar.module.css';
import { useGetReporteeQuery, useGetUserInfoQuery } from '@/rtk/features/userInfo/userInfoApi';

export const UserInfoBar = () => {
  const { data: userData } = useGetUserInfoQuery();
  const { data: reporteeData } = useGetReporteeQuery();

  return (
    <header className={classes.userInfoBar}>
      <div>
        <AltinnTextLogo title='Altinn' />
      </div>
      <div className={classes.userInfoContent}>
        <div className={classes.userInfoTextContainer}>
          {userData?.name && <span className={classes.userInfoText}>{userData.name}</span>}
          {reporteeData?.name && reporteeData.name !== userData?.name && (
            <span className={classes.userInfoText}>for {reporteeData.name}</span>
          )}
        </div>
        <Buildings3FillIcon className={classes.companyIconContainer} />
      </div>
    </header>
  );
};
