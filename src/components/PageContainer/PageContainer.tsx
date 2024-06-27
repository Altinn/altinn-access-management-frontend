import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@navikt/aksel-icons';
import { getRedirectToProfileUrl } from '@/resources/utils';
import { UserInfoBar } from '../UserInfoBar/UserInfoBar';
import classes from './PageContainer.module.css';
import { Button } from '@digdir/designsystemet-react';

export interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  const { t } = useTranslation('common');

  return (
    <div className={classes.pageMargin}>
      <div className={classes.pageContainer}>
        <UserInfoBar />
        <div className={classes.closeButtonContainer}>
          <Button
            icon={true}
            title={t('common.close')}
            className={classes.closeButton}
            size='small'
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
