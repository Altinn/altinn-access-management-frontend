import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';
import { useEffect } from 'react';

import { ReactComponent as AltinnLogo } from '@/assets/AltinnTextLogo.svg';
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
    if (userLoading || reporteeLoading) {
      void dispatch(fetchUserInfo());
      void dispatch(fetchReportee());
    }
  }, []);

  return (
    <div className={classes.userInfoBarMargin}>
      <div className={classes.userInfoBar}>
        <div className={classes.altinnLogo}>
          <AltinnLogo />
        </div>
        <div className={classes.userInfoContent}>
          <div>
            {userInfoName && <h5 className={classes.userText}>{userInfoName}</h5>}
            {reporteeName && <h5 className={classes.userText}>for {reporteeName}</h5>}
          </div>
          <div>
            <SvgIcon
              width={24}
              height={24}
              svgIconComponent={<Office1Filled />}
            ></SvgIcon>
          </div>
        </div>
      </div>
    </div>
  );
};
