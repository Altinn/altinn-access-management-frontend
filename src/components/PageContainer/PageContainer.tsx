import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@navikt/aksel-icons';

import { redirectToProfile } from '@/resources/utils';

import { UserInfoBar } from '../UserInfoBar/UserInfoBar';

import classes from './PageContainer.module.css';

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
          <button
            className={classes.closeButton}
            aria-label={String(t('common.close'))} // Should this rather be "Avslutt" or "Cancel" as you are not closing anything?
            onClick={redirectToProfile}
          >
            <XMarkIcon
              width={36}
              height={30}
              className={classes.closeIcon}
            />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
