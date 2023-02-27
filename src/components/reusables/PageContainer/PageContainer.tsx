import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@altinn/altinn-design-system';
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
    window.location.pathname = '/ui/' + RouterPath.Profile;
  };

  return (
    <div className={classes.pageMargin}>
      <div className={classes.pageContainer}>
        <UserInfoBar />
        <div className={classes.exitButton}>
          <Button
            variant={ButtonVariant.Quiet}
            color={ButtonColor.Inverted}
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
