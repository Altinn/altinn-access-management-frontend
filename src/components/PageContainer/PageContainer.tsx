import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@navikt/aksel-icons';
import { DsButton } from '@altinn/altinn-components';

import { UserInfoBar } from '../UserInfoBar/UserInfoBar';

import classes from './PageContainer.module.css';

import { getRedirectToProfileUrl } from '@/resources/utils';

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
          <DsButton
            icon={true}
            title={t('common.close')}
            className={classes.closeButton}
            data-size='sm'
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
          </DsButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
