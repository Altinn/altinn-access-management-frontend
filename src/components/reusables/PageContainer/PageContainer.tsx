import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ExitIcon } from '@/assets/Error.svg';
import { RouterPath } from '@/routes/Router';

import { UserInfoBar } from '../UserInfoBar/UserInfoBar';

import classes from './PageContainer.module.css';

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const { t } = useTranslation('common');

  const redirectToProfile = () => {
    const currentEnv = window.location.href;
    if (currentEnv.includes('am.ui.at23')) {
      window.location.href = RouterPath.ProfileAT23;
    } else if (currentEnv.includes('altinn.no')) {
      window.location.href = RouterPath.ProfileProd;
    } else {
      window.location.pathname = '/ui/' + RouterPath.Profile;
    }
  };

  return (
    <div className={classes.pageMargin}>
      <div className={classes.pageContainer}>
        <UserInfoBar />
        <div className={classes.exitButton}>
          <Button
            variant={ButtonVariant.Outline}
            color={ButtonColor.Secondary}
            size={ButtonSize.Medium}
            icon={<ExitIcon />}
            aria-label={String(t('common.close'))}
            onClick={redirectToProfile}
          ></Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
