import { SvgIcon } from '@altinn/altinn-design-system';
import * as React from 'react';
import { Office1Filled } from '@navikt/ds-icons';
import { useEffect } from 'react';

import { ReactComponent as AltinnLogo } from '@/assets/AltinnTextLogo.svg';
import { useAppDispatch, useAppSelector } from '@/rtk/app/hooks';
import { fetchUserInfo } from '@/rtk/features/userInfo/userInfoSlice';

import classes from './UserInfoBar.module.css';

export const UserInfoBar = () => {
  const userInfoName = useAppSelector((state) => state.userInfo.name);
  const userLoading = useAppSelector((state) => state.userInfo.userLoading);
  const reporteeLoading = useAppSelector((state) => state.userInfo.reporteeLoading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userLoading) {
      void dispatch(fetchUserInfo());
    }
  }, []);

  return (
    <div className={classes.userInfoBar}>
      <div className={classes.altinnLogo}>
        <AltinnLogo />
      </div>
      <div className={classes.userInfoContent}>
        <div>
          <h5 className={classes.userText}>{userInfoName}</h5>
          <h5 className={classes.userText}>for SPAREBANK 1 Utvikling</h5>
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
  );
};
