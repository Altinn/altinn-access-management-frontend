import * as React from 'react';
import { Buildings3FillIcon } from '@navikt/aksel-icons';
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
        <Buildings3FillIcon className={classes.companyIconContainer} />
      </div>
    </header>
  );
};
