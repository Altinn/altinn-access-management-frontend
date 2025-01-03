import React from 'react';
import { Button } from '@digdir/designsystemet-react';
import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { getButtonIconSize } from '@/resources/utils/iconUtils';

import classes from './PageContainer.module.css';

interface PageContainerProps {
  children: React.ReactNode;
  pageActions?: React.ReactNode | React.ReactNode[];
  contentActions?: React.ReactNode | React.ReactNode[];
  onNavigateBack?: () => void;
}

export const PageContainer = ({
  children,
  pageActions,
  contentActions,
  onNavigateBack,
}: PageContainerProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.container}>
      <div className={classes.topActions}>
        <div className={classes.pageActions}>
          {onNavigateBack && (
            <Button
              variant='tertiary'
              color='neutral'
              onClick={onNavigateBack}
              icon
            >
              <ArrowLeftIcon fontSize={getButtonIconSize(true)} />
              {t('common.back')}
            </Button>
          )}
          {pageActions}
        </div>
        <div className={classes.contentActions}>{contentActions}</div>
      </div>
      <div className={classes.pageContent}>{children}</div>
    </div>
  );
};
