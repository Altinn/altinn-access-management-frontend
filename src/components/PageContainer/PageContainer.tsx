import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@navikt/aksel-icons';
import { Button } from '@digdir/designsystemet-react';

import { getRedirectToProfileUrl } from '@/resources/utils';

import { UserInfoBar } from '../UserInfoBar/UserInfoBar';

import classes from './PageContainer.module.css';

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const { t } = useTranslation();

  return (
    <div className={classes.background}>
      <div className={classes.pageContainer}>
        <UserInfoBar />
        <div className={classes.closeButtonContainer}>
          <Button
            icon={true}
            title={t('common.close')}
            className={classes.closeButton}
            size='sm'
            aria-label={String(t('common.cancel'))}
            asChild
          >
            <a href={getRedirectToProfileUrl()}>
              <XMarkIcon
                width={30}
                height={30}
                className={classes.closeIcon}
              />
            </a>
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
