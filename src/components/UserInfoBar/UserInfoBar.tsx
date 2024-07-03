import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';
import classes from './UserInfoBar.module.css';
import { useGetReporteeQuery, useGetUserInfoQuery } from '@/rtk/features/userInfo/userInfoApi';

export const UserInfoBar = () => {
  const { data: userData, isFetching: userIsFetching } = useGetUserInfoQuery();
  const { data: reporteeData, isFetching: reporteeFetching } = useGetReporteeQuery();

  return (
    <header className={classes.userInfoBar}>
      <div>
        <AltinnTextLogo title='Altinn' />
      </div>
      <div className={classes.userInfoContent}>
        <div className={classes.userInfoTextContainer}>
          {!userIsFetching && <p className={classes.userInfoText}>{userData.name}</p>}
          {!reporteeFetching && !userIsFetching && userData?.name !== reporteeData?.name && (
            <p className={classes.userInfoText}>for {reporteeData.name}</p>
          )}
        </div>
        <div className={classes.companyIconContainer}>
          <SvgIcon
            width={24}
            height={24}
            svgIconComponent={<Office1Filled />}
          ></SvgIcon>
        </div>
      </div>
    </header>
  );
};
