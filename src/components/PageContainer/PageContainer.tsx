import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from '@/assets/RedClose.svg';
import { RouterPath } from '@/routes/Router';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { UserInfoBar } from '../UserInfoBar/UserInfoBar';

import classes from './PageContainer.module.css';

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const { t } = useTranslation('common');

  const redirectToProfile = () => {
    const cleanHostname = window.location.hostname.replace('am.ui.', '');
    window.location.href =
      'https://' + cleanHostname + '/' + RouterPath.Profile + '?R=' + getCookie('AltinnPartyId');
  };

  return (
    <div className={classes.pageMargin}>
      <div className={classes.pageContainer}>
        <UserInfoBar />
        <div className={classes.closeButtonContainer}>
          <button
            className={classes.closeButton}
            aria-label={String(t('common.close'))}
            onClick={redirectToProfile}
          >
            <CloseIcon
              width={36}
              height={30}
            />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
