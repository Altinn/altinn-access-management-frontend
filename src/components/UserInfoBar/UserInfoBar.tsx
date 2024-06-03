import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';
import { useEffect } from 'react';

import AltinnTextLogo from '@/assets/AltinnTextLogo.svg?react';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { fetchUserInfo, fetchReportee } from '@/rtk/features/userInfo/userInfoSlice';

import classes from './UserInfoBar.module.css';

export const UserInfoBar = () => {
  const userInfoName = useAppSelector((state) => state.userInfo.personName);
  const reporteeName = useAppSelector((state) => state.userInfo.reporteeName);
  const userLoading = useAppSelector((state) => state.userInfo.userLoading);
  const reporteeLoading = useAppSelector((state) => state.userInfo.reporteeLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userLoading) {
      void dispatch(fetchUserInfo());
    }
    if (reporteeLoading) {
      void dispatch(fetchReportee());
    }
  }, []);

  return (
    <header className={classes.userInfoBar}>
      <div>
        <AltinnTextLogo title='Altinn' />
      </div>
      <div className={classes.userInfoContent}>
        <div className={classes.userInfoTextContainer}>
          {userInfoName && <p className={classes.userInfoText}>{userInfoName}</p>}
          {userInfoName !== reporteeName && reporteeName && (
            <p className={classes.userInfoText}>for {reporteeName}</p>
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
